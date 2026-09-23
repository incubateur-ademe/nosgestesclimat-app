import { vi } from 'vitest'

import type { Logger, ScopeName } from '../features/logger/index.ts'

/** Spied function, typed so the declaration build does not leak vitest's `Mock`. */
type Spy = (...args: unknown[]) => void

export type TestLogger = Logger & {
  error: Spy
  warn: Spy
  info: Spy
  debug: Spy
  fatal: Spy
  child: Spy
}

/**
 * Spied `Logger` for service tests. `child` returns the same instance, so
 * assertions keep targetting the top-level spies whatever the bindings.
 */
export function createTestLogger(): TestLogger {
  const logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(),
    // No span in a test: what a service hands to the logger is asserted, not
    // the trace it sits in. The body logs through the same spied instance,
    // whichever scope it runs under.
    withChildSpan: <Result>(
      scope: ScopeName,
      run: (logger: Logger) => Promise<Result>
    ): Promise<Result> => run(logger.child({ scope })),
  } satisfies Logger

  logger.child.mockReturnValue(logger)

  return logger
}
