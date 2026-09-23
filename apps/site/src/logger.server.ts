import { captureException } from '@sentry/nextjs'
import { unstable_rethrow } from 'next/navigation'

import { createLogger } from './logger'

/** Site logger, wired to Sentry for the captures and to Next for control flow. */
const logger = createLogger({
  service: 'site',
  onCapture: captureException,
  rethrowControlFlow: unstable_rethrow,
})

export default logger
