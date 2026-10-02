import 'server-only'

import { captureException } from '@sentry/nextjs'
import { unstable_rethrow } from 'next/navigation'

import { env } from '@/env/server'
import { captureToPostHog } from '@/observability/error-capture'
import { createLogger } from './logger.node'

/** Site server logger: Sentry for the captures, Next for the control flow. The
 * implementation (`logger.node.ts`) is shared with the worker, which wires its
 * own — a Node process has neither Next nor Sentry-next to import, nor the
 * `react-server` condition that empties `server-only`.
 *
 * Both sinks are fed while Sentry is on its way out, with the same attributes
 * as the line: PostHog gets the error with the identity and the request context
 * it came from, Sentry adds its release until it is removed. */
const logger = createLogger({
  service: 'web-server',
  level: env.LOG_LEVEL,
  pretty: env.LOG_PRETTY,
  onCapture: (error, line) => {
    captureException(error, { extra: line })
    captureToPostHog(error, line)
  },
  rethrowControlFlow: unstable_rethrow,
})

export default logger
