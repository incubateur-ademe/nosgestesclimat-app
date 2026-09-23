import type { LogMeta } from '../features/logger/index.ts'
import type { WithSpan } from '../features/tracing/index.ts'
import type { BackgroundTaskRunner } from './background-task-runner.ts'
import type { ErrorWithCode } from './errors.ts'
import type { Result } from './result.ts'
import { toError } from './to-error.ts'

/** What a service needs to run a side effect outside the request. */
export type SideEffectDeps = {
  withSpan: WithSpan
  backgroundTaskRunner: BackgroundTaskRunner
}

/**
 * Runs a side effect in its own span, deferred by the runner so it outlives the
 * response. A failure is reported under the name of the call it comes from and
 * never undoes the work that triggered it: the next side effect still runs.
 *
 * The span is opened by the wrapped task, not at dispatch, so its duration is
 * the work — not the wait before it starts.
 */
export function runSideEffect<Failure extends ErrorWithCode>(
  deps: SideEffectDeps,
  name: string,
  run: () => Promise<Result<void, Failure>>,
  /** What the caller knows about this call (the ids it was made with). */
  meta: LogMeta = {}
): void {
  const task = deps.withSpan(`core.sideEffect.${name}`, async ({ logger }) => {
    try {
      const result = await run()

      if (!result.success) {
        logger.error(result.error, { sideEffect: name, ...meta })
      }
    } catch (error) {
      logger.error(toError(error), { sideEffect: name, ...meta })
    }
  })

  deps.backgroundTaskRunner(task)
}
