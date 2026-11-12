import type { ScopeName } from '@nosgestesclimat/core/features/logger/index'
import { toError } from '@nosgestesclimat/core/lib/to-error'

import logger from '@/logger/logger.browser'

/** A server-rendered error carries a Next.js digest. `onRequestError` already
 * reported it with the real message and stack, so the client can only echo it. */
export function isServerReportedError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'digest' in error
}

/** The browser's only capture path — the SDK's own is off. `logger.error` files
 * the error in Error Tracking, with the scope that makes it findable. */
export function reportUncaughtError(error: unknown, scope: ScopeName): void {
  if (isServerReportedError(error)) return
  logger.error(toError(error), { scope })
}

/** Next exposes no client hook for these: the app registers them itself, as the
 * server does with `process.on`. */
export function registerUncaughtErrorHandlers(): void {
  window.addEventListener('unhandledrejection', (event) => {
    reportUncaughtError(event.reason, 'site.view.unhandledRejection')
  })
  window.addEventListener('error', (event) => {
    // Absent when a resource failed to load, which is not an exception.
    if (!event.error) return
    reportUncaughtError(event.error, 'site.view.uncaughtError')
  })
}
