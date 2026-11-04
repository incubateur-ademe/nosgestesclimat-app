import 'server-only'

import { unstable_rethrow } from 'next/navigation'

import { env } from '@/env/server'
import { captureToPostHog } from '@/observability/error-capture'
import { createLogger } from './logger.node'

/** Site server logger: PostHog capture + Next control flow. Shared with the
 * worker via `logger.node.ts`. */
const logger = createLogger({
  service: 'web-server',
  verbosity: env.NEXT_PUBLIC_LOG_VERBOSITY,
  pretty: env.LOG_PRETTY,
  onCapture: captureToPostHog,
  rethrowControlFlow: unstable_rethrow,
})

export default logger
