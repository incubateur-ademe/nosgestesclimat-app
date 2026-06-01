import { captureException } from '@sentry/node'
import type { Exception } from '../../exception.ts'

const isDev = process.env.NODE_ENV === 'development'

export function log(exception: Exception<Record<string, unknown>>) {
  // @TODO : use a proper loguer abstraction here (winston?)
  if (isDev) {
    const consoleFn =
      exception.level === 'info'
        ? console.info
        : exception.level === 'warning'
          ? console.warn
          : console.error
    consoleFn(
      `[${exception.level ?? 'error'}] ${exception.name}: ${exception.message}`,
      exception.payload ?? '',
      exception.cause ?? ''
    )
  }
  captureException(exception, {
    level: exception.level,
    extra: exception.payload,
  })
}
