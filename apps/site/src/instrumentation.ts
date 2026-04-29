import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
    const { posthogClient } = await import('./services/tracking/posthogServer')

    async function shutdown() {
      try {
        await posthogClient.shutdown()
        process.exit(0)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        process.exit(1)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGINT', shutdown)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGTERM', shutdown)
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
