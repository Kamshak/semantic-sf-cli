const log = require('npmlog')
const { writeFileSync, readFileSync, existsSync } = require('fs')
const ini = require('ini')

module.exports = function (pkg, info) {
  var gitignore = null
  try {
    gitignore = readFileSync('.gitignore', 'utf-8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      gitignore = ''
    } else {
      throw err
    }
  }
  const gitignoreLines = gitignore.split(/[\r\n]+/)
    .filter(Boolean)

  const addToGitignore = [
    'node_modules',
    '.env'
  ]
  for (let addLine of addToGitignore) {
    if (gitignoreLines.findIndex(line => line === addLine) === -1) {
      writeFileSync('.gitignore', `${gitignore}\n${addLine}\n`)
      log.info(`Added ${addLine} to .gitignore`)
    }
  }

  var envContents = {}
  try {
    envContents = ini.parse(readFileSync('.env', 'utf-8'))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
  envContents['GH_TOKEN'] = info.github.token
  envContents['SF_APIKEY'] = info.scriptfodder.apiKey
  envContents['SF_SCRIPTID'] = info.scriptfodder.scriptId

  writeFileSync('.env', ini.stringify(envContents))
  log.info('Wrote environment variables to .env file.')

  writeFileSync('.gmodignore', [
    'node_modules',
    'package.json',
    '.gitignore',
    '.editorconfig',
    '.npmrc',
    '*.log',
    '.DS_Store',
    '*.tmp',
    '.gmodignore',
    '*.tmp.md'
  ].join('\n'))
  log.info('Wrote .gmodignore')
}
