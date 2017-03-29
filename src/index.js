const {readFileSync, writeFileSync} = require('fs')

const _ = require('lodash')
const {promisify} = require('bluebird')
const nopt = require('nopt')
const npm = require('npm')
const request = require('request-promise').defaults({json: true})

const getLog = require('./lib/log')

const ownPkg = require('../package.json')
let pkg = JSON.parse(readFileSync('./package.json'))

require('update-notifier')({
  pkg: _.defaults(
    ownPkg,
    {version: '0.0.0'}
  )
}).notify()

const knownOptions = {
  tag: String,
  version: Boolean,
  help: Boolean,
  keychain: Boolean,
  'ask-for-passwords': Boolean,
  'gh-token': String,
  'sf-apikey': String
}

const shortHands = {
  v: ['--version'],
  h: ['--help']
}

module.exports = async function (argv) {
  let info = {
    options: _.defaults(
      nopt(knownOptions, shortHands, argv, 2),
      {
        keychain: true,
        tag: 'latest'
      }
    )
  }

  if (info.options.version) {
    console.log(ownPkg.version || 'development')
    process.exit(0)
  }

  if (info.options.argv.remain[0] !== 'setup' && info.options.argv.remain[0] !== 'init' || info.options.help) {
    console.log(`
semantic-sf-cli

Usage:
  semantic-sf-cli setup

Options:
  -h --help            Show this screen.
  -v --version         Show version.
  --[no-]keychain      Use keychain to get passwords [default: true].
  --ask-for-passwords  Ask for the passwords even if passwords are stored [default: false].
  --gh-token=<String>  Github auth token
  --sf-apikey=<String> Scriptfodder API Key
Aliases:
  init                 setup`)
    process.exit(0)
  }

  try {
    var config = (await promisify(npm.load.bind(npm))({progress: false})).config
  } catch (e) {
    console.log('Failed to load npm config.', e)
    process.exit(1)
  }

  info.loglevel = config.get('loglevel') || 'warn'
  const log = info.log = getLog(info.loglevel)

  try {
    await require('./lib/repository')(pkg, info)
    await require('./lib/github')(pkg, info)
    await require('./lib/scriptfodder')(pkg, info)
    await require('./lib/ci')(pkg, info)
    require('./lib/dotenv')(pkg, info)
  } catch (err) {
    log.error(err)
    process.exit(1)
  }

  pkg.version = '0.0.0-development'

  pkg.scripts = pkg.scripts || {}
  pkg.scripts['sf-release'] = 'semantic-release pre && sf-publish && semantic-release post'

  pkg.repository = pkg.repository || {
    type: 'git',
    url: info.giturl
  }

  if (info.ghrepo.private && !pkg.publishConfig) {
    pkg.publishConfig = {access: 'restricted'}
  }

  try {
    const {'dist-tags': distTags} = await request('https://registry.npmjs.org/semantic-release')

    pkg.devDependencies = pkg.devDependencies || {}
    pkg.devDependencies['semantic-release'] = `^${distTags[info.options.tag]}`
  } catch (e) {
    log.error('Could not get latest `semantic-sf-release` version.', e)
  }

  const dependencies = [
    'dotenv',
    'last-release-git',
    'semantic-release-noop'
  ]
  try {
    for (let dep of dependencies) {
      const {'dist-tags': distTags} = await request('https://registry.npmjs.org/' + dep)

      pkg.devDependencies = pkg.devDependencies || {}
      pkg.devDependencies[dep] = `^${distTags['latest']}`
      log.info(`added: ${dep}@^${distTags['latest']}`)
    }
  } catch (e) {
    log.error('Could not get dependency version.', e)
  }

  pkg.release = pkg.release || {}
  pkg.release.getLastRelease = 'last-release-git'
  pkg.release.verifyConditions = 'semantic-release-noop'

  log.verbose('Writing `package.json`.')
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
  log.info('Done.')
}
