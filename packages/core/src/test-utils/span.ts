import type { Logger } from '../features/logger/index.ts'
import type { WithSpan } from '../features/tracing/index.ts'

/**
 * Runs the callback with a logger bound to the component, without any span: a
 * test asserts what a service hands to the logger, not the trace it sits in.
 */
export const createTestWithSpan: (logger: Logger) => WithSpan =
  (logger) => (component, run) => (params) =>
    run({ ...(params ?? {}), logger: logger.child({ component }) } as never)
