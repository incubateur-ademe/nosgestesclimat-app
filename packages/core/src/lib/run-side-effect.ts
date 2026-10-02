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

/**
 * Runs a side effect in its own span, deferred by the runner so it outlives the
 * response. The work receives the span's logger, so its lines carry the side
 * effect's scope and the caller's bindings by default. A failure is reported,
 * and never undoes the work that triggered it: the next side effect still runs.
 *
 * The span is opened by the wrapped task, not at dispatch: its duration is the
 * work, not the wait before it starts.
 */
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
