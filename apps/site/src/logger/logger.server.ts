import 'server-only'

import { captureException } from '@sentry/nextjs'
import { unstable_rethrow } from 'next/navigation'

import { env } from '@/env/server'
import { captureToPostHog } from '@/observability/error-capture'
import { createLogger } from './logger.node'

/** Site server logger: Sentry captures + Next control flow. Shared with the
 * worker via `logger.node.ts`; both sinks receive the same attributes. */
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
