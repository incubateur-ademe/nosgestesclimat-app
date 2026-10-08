import type { Logger } from '../features/logger/index.ts'
import type { BackgroundTaskRunner } from './background-task-runner.ts'
import type { ErrorWithCode } from './errors.ts'
import type { Result } from './result.ts'
import { toError } from './to-error.ts'

/** What a service needs to run a side effect outside the request. */
export type SideEffectDeps = {
  /**
   * The logger of the operation the side effect belongs to: its lines inherit
   * the caller's bindings, so no second channel carries the context.
   */
  logger: Logger
  backgroundTaskRunner: BackgroundTaskRunner
}

/** Runs a side effect in its own span, deferred so it outlives the response.
 * Failure is reported but never undoes the triggering work. Span duration =
 * the work, not the wait. */
export function runSideEffect<Failure extends ErrorWithCode>(
  name: string,
  { logger, backgroundTaskRunner }: SideEffectDeps,
  run: (logger: Logger) => Promise<Result<void, Failure>>
): void {
  backgroundTaskRunner(() =>
    logger.withSpan(`core.sideEffect.${name}`, async (sideEffectLogger) => {
      try {
        const result = await run(sideEffectLogger)

        if (!result.success) {
          sideEffectLogger.error(result.error)
        }
      } catch (error) {
        sideEffectLogger.error(toError(error))
      }
    })
  )
}
