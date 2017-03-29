const log = require('npmlog')
const { writeFileSync, readFileSync } = require('fs')
const ini = require('ini')

module.exports = function (pkg, info) {
  log.info('hi')
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

  if (gitignoreLines.findIndex(line => line === '.env') === -1) {
    writeFileSync('.gitignore', gitignore + '\n.env\n')
    log.info('Added .env to .gitignore')
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
}
