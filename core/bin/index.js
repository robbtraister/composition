'use strict'

const fs = require('fs')
const path = require('path')

const run = require('@composition/runtime/bin/run')
const { projectRoot } = require('@composition/runtime/env')

const { copyFile, mkdirp } = require('../src/utils/promises')

const coreRoot = path.resolve(__dirname, '..')

// async function tryToCopy (src, dst) {
//   try {
//     await copyFile(src, dst, fs.constants.COPYFILE_EXCL)
//   } catch (_) {}
// }

async function init () {
  await exec(`cp -nR '${__dirname}/templates'/* '${projectRoot}/src/'`)
  // await mkdirp(path.join(projectRoot, 'src', 'server', 'router'))
  // await mkdirp(path.join(projectRoot, 'src', 'views', 'app'))
  // await mkdirp(path.join(projectRoot, 'src', 'views', 'site'))
  // await tryToCopy(
  //   path.join(packageRoot, 'bin', 'templates', 'app.tsx'),
  //   path.join(projectRoot, 'src', 'views', 'app', 'index.tsx')
  // )
  // await tryToCopy(
  //   path.join(packageRoot, 'bin', 'templates', 'site.tsx'),
  //   path.join(projectRoot, 'src', 'views', 'site', 'index.tsx')
  // )
  // await tryToCopy(
  //   path.join(packageRoot, 'bin', 'templates', 'index.html'),
  //   path.join(projectRoot, 'src', 'views', 'index.html')
  // )
  // await tryToCopy(
  //   path.join(packageRoot, 'bin', 'templates', 'router.ts'),
  //   path.join(projectRoot, 'src', 'server', 'router', 'index.ts')
  // )
}

module.exports = {
  build: (...args) => run(coreRoot, 'build', ...args),
  clean: (...args) => run(coreRoot, 'clean', ...args),
  dev: (...args) => run(coreRoot, 'dev', ...args),
  prod: (...args) => run(coreRoot, 'prod', ...args),
  watch: (...args) => run(coreRoot, 'watch', ...args)
}
