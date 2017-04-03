const Promise = require('bluebird')
const exec = Promise.promisify(require('child_process').exec)
const { clean, lt } = require('semver')
const log = require('npmlog')
log.addLevel('print', 100000, { fg: 'green' })

module.exports = async function (pkg, info) {
  let latestVersion
  try {
    const refs = (await exec('git show-ref --tags')).toString('utf-8').trim().split('\n')

    for (const ref of refs) {
      const [commitHash, refName] = ref.split(' ') // eslint-disable-line no-unused-vars
      const version = clean(refName.split('/')[2])

      // version is null if not valid
      if (version && (!latestVersion || lt(latestVersion, version))) {
        latestVersion = version
      }
    }
  } catch (e) {
    log.verbose('Could not get tags', e)
  }

  if (!latestVersion) {
    // There is no valid semver git tag.
    // Creating the first valid tag via git tag v0.0.0
    try {
      log.info('git-tag', 'Creating intial tag for version v0.0.0')
      await exec('git tag v0.0.0')
      log.print('git-tag', 'Initialized current version with git tag v0.0.0. Run git push --tags to publish the tag.')
    } catch (e) {
      log.verbose('Error running git tag', e)
      throw new Error('Could not create tag v0.0.0')
    }
  }
}
