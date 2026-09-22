import { captureException } from '@sentry/nextjs'

import { createLogger } from './logger'

/** Site logger, wired to Sentry for the captures. */
const logger = createLogger({
  service: 'site',
  onCapture: captureException,
})

export default logger
