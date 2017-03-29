const _ = require('lodash')
const inquirer = require('inquirer')

const cis = {
  'Other (prints tokens)': (pkg, info) => {
    const message = `
${_.repeat('-', 46)}
GH_TOKEN=${info.github.token}
SF_APIKEY=${info.scriptfodder.apiKey}
SF_SCRIPTID=${info.scriptfodder.scriptId}
${_.repeat('-', 46)}
`
    console.log(message)
  }
}

module.exports = async function (pkg, info) {
  const choices = _.keys(cis)

  const answers = await inquirer.prompt([{
    type: 'list',
    name: 'ci',
    message: 'What CI are you using?',
    choices,
    default: info.ghrepo && info.ghrepo.private ? 1 : 0
  }])

  await cis[answers.ci].apply(null, _.compact([answers.endpoint, pkg, info]))
}
