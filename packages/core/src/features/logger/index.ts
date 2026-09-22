export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/** Layers a unit can belong to. Widening this list is deliberate: the values
 * end up in searches and alerts. */
export type ComponentLayer =
  | 'action'
  | 'service'
  | 'middleware'
  | 'instrumentation'
  | 'page'
  | 'layout'
  | 'sideEffect'

/** Workspaces that emit telemetry. */
export type ComponentPackage = 'core' | 'site'

/**
 * Qualified name of the unit that emits — `<package>.<layer>.<unit>`, e.g.
 * `core.service.engineRegistry`. The shape is enforced by the compiler; the
 * uniqueness across units stays a review rule (§7.7 of the logging manual).
 */
export type ComponentName = `${ComponentPackage}.${ComponentLayer}.${string}`

/**
 * Attributes of a line. Never PII nor business payloads: they are exported to
 * PostHog, outside the nginx collector that scrubs its own logs. Scalars
 * query best; anything structured ends up as JSON text.
 */
export type LogMeta = { component?: ComponentName } & Record<string, unknown>

/** Static context merged into every line of a child logger. */
export type LogBindings = { component?: ComponentName } &
  Record<string, unknown>

export interface LogOptions {
  /**
   * Sentry report. Defaults to true for error/fatal, false otherwise;
   * deviating from the default requires a justifying comment at the call site.
   */
  capture?: boolean
}

export interface Logger {
  /** New logger with `bindings` merged into every line. Does not mutate the parent. */
  child(bindings: LogBindings): Logger
  debug(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  /** An `Error` when one was caught: it keeps its stack in the log, without a capture. */
  warn(message: string | Error, meta?: LogMeta, options?: LogOptions): void
  /** Requires an `Error`: a message alone can be neither located nor deduplicated. */
  error(error: Error, meta?: LogMeta, options?: LogOptions): void
  /** Like `error`, for failures the process cannot continue after. */
  fatal(error: Error, meta?: LogMeta, options?: LogOptions): void
}
