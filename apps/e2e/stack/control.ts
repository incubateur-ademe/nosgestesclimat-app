import { createServer } from 'node:http'
import { CONTROL_PORT } from './config.ts'
import { restartStack } from './processes.ts'

const restartRoute = new URLPattern({ pathname: '/stacks/:i/restart' })

/**
 * The stacks are children of the process that ran globalSetup. A Playwright
 * worker asks it here to restart its own stack, once its database is empty.
 */
export const startControl = async ({
  dev,
  stacks,
}: {
  dev: boolean
  stacks: number
}) => {
  const server = createServer((req, res) => {
    // `req.url` is path-only: URLPattern parses it against an origin.
    const match = restartRoute.exec(req.url ?? '', 'http://localhost')
    const i = Number(match?.pathname.groups.i)

    if (req.method !== 'POST' || !Number.isInteger(i) || i >= stacks) {
      res.writeHead(404).end()
      return
    }

    restartStack(i, { dev }).then(
      () => res.writeHead(204).end(),
      (error: unknown) => {
        res
          .writeHead(500)
          .end(error instanceof Error ? error.message : String(error))
      }
    )
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(CONTROL_PORT, 'localhost', resolve)
  })

  return async () => {
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

/** Restarts the stack of the calling Playwright worker. */
export const requestStackRestart = async () => {
  const i = process.env.TEST_PARALLEL_INDEX
  const response = await fetch(
    `http://localhost:${CONTROL_PORT}/stacks/${i}/restart`,
    { method: 'POST' }
  )

  if (!response.ok) {
    throw new Error(
      `Restarting stack ${i} failed (${response.status}): ${await response.text()}`
    )
  }
}
