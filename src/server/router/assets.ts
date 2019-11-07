'use strict'

import path from 'path'

import express from 'express'

export default function router (options) {
  const publicRoot = path.resolve(options.projectRoot || '.', 'public')

  const assetRouter = express()

  assetRouter.all(
    '/favicon.ico',
    express.static(publicRoot),
    (req, res, next) => { res.sendStatus(404) }
  )
  assetRouter.use('/dist', express.static(path.resolve(options.projectRoot || '.', 'dist')))
  assetRouter.use(express.static(publicRoot))

  return assetRouter
}
