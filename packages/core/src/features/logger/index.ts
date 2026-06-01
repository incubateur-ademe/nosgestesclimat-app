import { captureException } from '@sentry/node'
import type { Exception } from '../../exception.ts'

export function log(exception: Exception<Record<string, unknown>>) {
  // @TODO : use a proper loguer abstraction here (winston?)
  captureException(exception, {
    level: exception.level,
    extra: exception.payload,
  })
}
