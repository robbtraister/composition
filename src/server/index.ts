'use strict'

import cluster from 'cluster'

import debug from 'debug'

import app from './app'

import * as env from '~/env'

const debugMaster = debug('composition:master')
const debugWorker = debug(`composition:worker:${process.pid}`)

export { app }

const getPort = (options: Options = {}) => Number(options.port) || env.port
const getWorkerCount = options => Number(options.workerCount) || env.workerCount

export function server(options: Options = {}) {
  process.on('disconnect', () => {
    debugWorker(`Disconnected`)
  })
  process.on('exit', code => {
    debugWorker(`Exited with code: ${code}`)
  })

  const port = getPort(options)

  return app(options).listen(port, err =>
    err ? console.error(err) : debugWorker(`Listening on port: ${port}`)
  )
}

async function createWorker() {
  return new Promise(resolve => {
    const worker = cluster.fork()
    // add an exit handler so cluster will replace worker in the event of an unintentional termination
    worker.on('exit', createWorker)
    worker.on('listening', resolve)
  })
}

async function createWorkers(n = env.workerCount) {
  return Promise.all([...new Array(n)].map(createWorker))
}

async function terminateWorker(
  worker,
  gracefulDelay = 5000,
  forcefulDelay = 10000
) {
  return new Promise(resolve => {
    // this worker is being purposely terminated; do not auto-replace it
    worker.off('exit', createWorker)

    worker.on('exit', resolve)

    worker.disconnect()

    setTimeout(() => {
      worker.kill()
    }, gracefulDelay)
    setTimeout(() => {
      worker.process.kill()
    }, forcefulDelay)
  })
}

export async function master(options: Options = {}) {
  const port = getPort(options)
  const workerCount = getWorkerCount(options)

  async function cycleWorkers() {
    const oldWorkers = Object.values(cluster.workers)

    const result = await createWorkers(workerCount)

    debugMaster(
      `${workerCount} worker${
        workerCount === 1 ? '' : 's'
      } Listening on port: ${port}`
    )

    const oldWorkerCount = oldWorkers.length
    if (oldWorkerCount) {
      Promise.all(oldWorkers.map(worker => terminateWorker(worker))).then(
        () => {
          debugMaster(
            `${oldWorkerCount} worker${
              oldWorkerCount === 1 ? '' : 's'
            } Terminated`
          )
        }
      )
    }

    return result
  }

  async function messageHandler(proc, msg: Message = {}) {
    const { id, type, action } = msg

    if (
      msg === 'restart' ||
      type === 'restart' ||
      (type === 'action' && action === 'restart')
    ) {
      try {
        await cycleWorkers()

        proc.send({ id, type: 'complete' })
      } catch (error) {
        proc.send({ id, type: 'error', error })
      }
    } else {
      proc.send({ id, type: 'unknown' })
    }
  }

  cluster.on('message', messageHandler)

  return cycleWorkers()
}

// cache the default app config for faster reload
export const devApp = env.isProd ? null : app()
