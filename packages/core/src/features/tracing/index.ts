import type { Logger, ScopeName } from '../logger/index.ts'

/**
 * Runs an operation in its own span, with a logger bound to the component.
 *
 * Core declares what deserves a span — a side effect, a long computation — and
 * the application supplies the tracer the way it supplies the logger: core
 * knows nothing about OpenTelemetry.
 *
 * Returns the wrapped function, so a service or an action keeps its public
 * signature and the span covers its whole body.
 */
export type WithSpan = <Params extends object, Result>(
  scope: ScopeName,
  run: (params: Params & { logger: Logger }) => Promise<Result>
) => [keyof Params] extends [never]
  ? () => Promise<Result>
  : (params: Params) => Promise<Result>
