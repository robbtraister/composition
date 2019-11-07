'use strict'

module.exports = {
  plugins: [
    [
      '@babel/proposal-decorators',
      {
        legacy: true
      }
    ],
    '@babel/syntax-dynamic-import',
    [
      '@babel/transform-runtime',
      {
        absoluteRuntime: true
      }
    ]
  ],
  presets: [
    '@babel/env',
    '@babel/react',
    [
      '@babel/typescript',
      {
        isTSX: true,
        allExtensions: true
      }
    ]
  ]
}
