# semantic-sf-cli
[![Build Status](https://travis-ci.org/Kamshak/semantic-sf-cli.svg?branch=master)](https://travis-ci.org/Kamshak/semantic-sf-cli)
[![NPM](https://nodei.co/npm/semantic-sf-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/semantic-sf-cli/)
## Install

```bash
npm install -g semantic-sf-cli

cd your-module
semantic-sf-cli setup
```

![dialogue](https://cloud.githubusercontent.com/assets/908178/8766357/f3eadaca-2e34-11e5-8ebb-d40b9ae613d7.png)

## Options

	Usage:
	  semantic-release-cli setup [options]

	Options:
	  -h --help           Show this screen.
	  -v --version        Show version.
	  --[no-]keychain     Use keychain to get passwords [default: true].
	  --ask-for-passwords Ask for the passwords even if passwords are stored [default: false].
	  --tag=<String>      npm tag to install [default: 'latest'].

	Aliases:
	  init                 setup

## What it Does
__semantic-sf-cli performs the following steps:__

1. Asks for the information it needs. You will need to provide it with:
	* Whether your GitHub repository is public or private
	* Your GitHub username
	* Your GitHub password (unless passwords were previously saved to keychain)
	* Your Script Fodder API Key
1. Save your passwords to your local OS's keychain using [keytar](https://www.npmjs.com/package/keytar) for future use (unless `--no-keychain` was specified)
1. Create GitHub Personal Token
	* Logs into GitHub using the username and password provided
	* Creates a [GitHub Personal Access Token](https://github.com/settings/tokens) and saves it for future use
1. Update your package.json
	* Remove `version` field (you don't need it anymore -- `semantic-release` will set the version for you automatically)
	* Add a `semantic-release` script: `"semantic-release": "semantic-release pre && npm publish && semantic-release post"`
	* Add `semantic-release` as a `devDependency`
	* Add or overwrite the [`repository` field](https://docs.npmjs.com/files/package.json#repository)
1. Login to Travis CI to configure the package
	* Enable builds of your repo
	* Add GH_TOKEN and NPM_TOKEN environment variables in the settings

## Other CI Servers

By default, `semantic-release-cli` supports the popular Travis CI server. If you select `Other` as your server during configuration, `semantic-release-cli` will print out the environment variables you need to set on your CI server. You will be responsible for adding these environment variables as well as configuring your CI server to run `npm run semantic-release` after all the builds pass.

Note that your CI server will also need to set the environment variable `CI=true` so that `semantic-release` will not perform a dry run. (Most CI services do this by default.) See the `semantic-release` documentation for more details.

## License

MIT License
2015 © Christoph Witzko and [contributors](https://github.com/semantic-release/cli/graphs/contributors)

![https://twitter.com/trodrigues/status/509301317467373571](https://cloud.githubusercontent.com/assets/908178/6091690/cc86f58c-aeb8-11e4-94cb-15f15f486cde.png)
