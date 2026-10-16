import { toError } from '@nosgestesclimat/core/lib/to-error'

import { createLogger } from '../logger/logger.node.ts'
import {
  captureException,
  flushErrorCapture,
  initErrorCapture,
} from './capture.ts'
import { shutdownObservability } from './setup.ts'

/**
 * Reports a process that dies before its own wiring is up: a missing
 * environment variable, a module that cannot load. Call it before anything that
 * reads the environment — a static import is evaluated before the module body.
 */
export const reportStartupFailures = (service: string): void => {
  const report = async (error: Error) => {
    // The contract may be exactly what failed: the raw variable is all this
    // can rely on.
    initErrorCapture({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN })

    const logger = createLogger({ service, onCapture: captureException })

    logger.fatal(error)

    await Promise.allSettled([shutdownObservability(), flushErrorCapture()])
    process.exit(1)
  }

  process.on('uncaughtException', (error) => void report(error))
  process.on('unhandledRejection', (reason) => void report(toError(reason)))
}
