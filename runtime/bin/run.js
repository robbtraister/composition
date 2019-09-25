'use strict'

const path = require('path')

const { projectRoot, runtimeRoot } = require('../env')

const { spawn } = require('../src/utils/promises')

async function run (cwd, cmd, ...args) {
  if (!cmd || cmd === '--') {
    process.stderr.write('available scripts:\n')
    const { scripts } = require(path.join(cwd, 'package.json'))
    Object.keys(scripts)
      .sort()
      .forEach(scriptName => {
        process.stderr.write(`  ${scriptName}\n`)
        process.stderr.write(`    ${scripts[scriptName]}\n`)
      })
  } else {
    // spawn will throw on SIGINT
    try {
      if (args.length > 0 && args[0] !== '--') {
        args.unshift('--')
      }
      await spawn('npm', ['run', cmd, ...args], {
        cwd,
        env: {
          ...process.env,
          PROJECT_ROOT: projectRoot,
          RUNTIME_ROOT: runtimeRoot
        },
        stdio: 'inherit'
      })
    } catch (e) {
      // ignore SIGINT
    }
  }
}

module.exports = run
