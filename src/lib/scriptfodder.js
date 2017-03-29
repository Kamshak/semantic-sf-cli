const _ = require('lodash')
const inquirer = require('inquirer')
const request = require('request-promise').defaults({
  json: true,
  headers: {
    'user-agent': 'semantic-sf-cli 0.1'
  }
})
const validator = require('validator')
const log = require('npmlog')

const passwordStorage = require('./password-storage')('scriptfodder')

function getAllSfScripts (info) {
  return request(`https://scriptfodder.com/api/scripts/?api_key=${info.scriptfodder.apiKey}`)
    .then(body => {
      if (body.status !== 'success') {
        return Promise.reject('Could not load SF Scripts')
      }
      return body.scripts
    })
}

async function askForSfScript (info) {
  const scripts = await getAllSfScripts(info)
  const answers = await inquirer.prompt([{
    name: 'scriptId',
    message: 'Select the ScriptFodder script:',
    type: 'list',
    choices: scripts.map(script => {
      return {
        name: script.name,
        value: script.id
      }
    })
  }])

  return answers.scriptId
}

module.exports = async function (pkg, info) {
  if (_.has(info.options, 'sf-apikey')) {
    info.scriptfodder = {
      apiKey: info.options['sf-apikey']
    }
    log.info('Using Scriptfodder token from command line argument.')
    return
  }

  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'apiKey',
    message: 'What is your Scripfodder API Key? (https://scriptfodder.com/dashboard/settings/api/new)',
    validate: _.ary(_.bind(validator.isLength, validator, _, 1), 1),
    when: answers => !info.options.keychain || info.options['ask-for-passwords'] || !passwordStorage.get('key')
  }])

  answers.apiKey = answers.apiKey || passwordStorage.get('key')
  info.scriptfodder = answers

  if (info.options.keychain) {
    passwordStorage.set('key', info.scriptfodder.password)
  }

  const scriptId = await askForSfScript(info)
  if (!scriptId) throw new Error('Could not select a script.')

  info.scriptfodder.scriptId = scriptId
  log.info('Chose script ' + scriptId)
}
