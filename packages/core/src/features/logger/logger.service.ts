import { captureException } from '@sentry/nextjs'
import type { Exception } from '../../exception.js'

export function logException(exception: Exception<Record<string, unknown>>) {
  // @TOFIX : use something else that @sentry/next here (couple with nextjs in core not good)
  captureException(exception, {
    level: exception.level,
    extra: exception.payload,
  })
}
