#!/usr/bin/env node

'use strict'

const { version } = require('.')

function tryToImport (dep) {
  try {
    return require(dep)
  } catch (_) {}
}

const commands = Object.assign(
  {},
  tryToImport('.'),
  tryToImport('@composition/core/bin') || {},
  {
    help,
    version: () => {
      process.stderr.write('composition: ')
      process.stdout.write(version())
      process.stderr.write('\n')
    }
  }
)

function help () {
  process.stderr.write(`composition: ${version()}

commands:
${Object.keys(commands)
  .sort()
  .map(cmd => `  ${cmd}`)
  .join('\n')}
`)
}

if (module === require.main) {
  const command = process.argv[2]
  const fn = commands[command] || commands.help
  fn(...process.argv.slice(3))
}
