'use strict'

const { projectRoot, runtimeRoot } = require('../env')

const run = require('./run')

function version () {
  return require('../package.json').version
}

module.exports = {
  run: (...args) => run(projectRoot, ...args),
  start: (...args) => run(runtimeRoot, 'start', ...args),
  version
}
