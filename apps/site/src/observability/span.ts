import type {
  Logger,
  ScopeName,
} from '@nosgestesclimat/core/features/logger/index'
import type { WithSpan } from '@nosgestesclimat/core/features/tracing/index'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { SpanStatusCode } from '@opentelemetry/api'
import { unstable_rethrow } from 'next/navigation'

import logger from '@/logger.server'
import { appTracer } from './setup'

/**
 * Runs an operation in its own span, named after the component, with a logger
 * bound to it. The wrapped function keeps its public signature, and the span
 * covers its whole body — so opening and closing cannot drift apart.
 *
 * The span is opened here rather than renamed on the caller's: an operation
 * called by another gets its own, nested span, and its duration is its own.
 *
 * `unstable_rethrow` lets a redirect or a `notFound()` through: control flow is
 * not a failure, and the span must not carry an error status for it.
 */
export const withSpan = function withSpan<Params extends object, Result>(
  scope: ScopeName,
  run: (params: Params & { logger: Logger }) => Promise<Result>
) {
  return async (params?: Params) =>
    await appTracer().startActiveSpan(scope, async (span) => {
      try {
        return await run({
          ...(params ?? ({} as Params)),
          logger: logger.child({ scope }),
        })
      } catch (error) {
        unstable_rethrow(error)

        span.recordException(toError(error))
        span.setStatus({ code: SpanStatusCode.ERROR })
        throw error
      } finally {
        span.end()
      }
    })
  // The implementation accepts an absent parameter; the contract decides whether
  // a caller may omit it.
} as WithSpan
