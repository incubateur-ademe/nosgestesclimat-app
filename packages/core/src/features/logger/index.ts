export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/** Layers a unit can belong to. Widening this list is deliberate: the values
 * end up in searches and alerts. */
export type ScopeLayer =
  | 'action'
  | 'service'
  | 'middleware'
  | 'instrumentation'
  | 'view'
  | 'sideEffect'
  | 'worker'

/** Workspaces that emit telemetry. */
export type ScopePackage = 'core' | 'site'

/**
 * Qualified name of the unit that emits — `<package>.<layer>.<unit>`, e.g.
 * `core.service.engineRegistry`. The shape is enforced by the compiler; the
 * uniqueness across units stays a review rule (§7.7 of the logging manual).
 */
export type ScopeName = `${ScopePackage}.${ScopeLayer}.${string}`

/**
 * Attributes another party named, kept as they are on the wire: a query engine
 * looks for `process.memory.usage`, not for our version of it. This is the
 * list `toAttributeKey` leaves alone.
 *
 * Ours carry the `ngc.` prefix: semantic conventions reserve the unprefixed
 * names, and a generic word (`code`, `job`, `count`) is what they explicitly
 * tell application developers to avoid.
 */
export type OtelAttributes = Partial<{
  'error.type': string
  'exception.type': string
  'exception.message': string
  'exception.stacktrace': string
  'process.memory.usage': number
  'v8js.memory.heap.used': number
  'http.request.method': string
  'http.route': string
  'url.path': string
  posthogDistinctId: string
  sessionId: string
  // Next owns this namespace: its spans carry the same names.
  [key: `next.${string}`]: string
}>

/**
 * Attributes of a line. Never PII nor business payloads: they are exported to
 * PostHog, outside the nginx collector that scrubs its own logs. Scalars
 * query best; anything structured ends up as JSON text.
 *
 * Our own keys are open on purpose: the transport prefixes them, so there is no
 * list to maintain. Typing pays where a value carries a contract — the
 * `component` shape here, and `OtelAttributes` on the producers that emit
 * standard names (`memoryAttributes`, the request identity).
 */
export type LogMeta = Record<string, unknown> & {
  /** Qualified name of the emitting unit, enforced: a bare name would not compile. */
  scope?: ScopeName
}

/** Static context merged into every line of a child logger. */
export type LogBindings = LogMeta

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
  /**
   * Runs an operation in its own span, with a logger bound to the scope: the
   * span covers the whole body, so opening and closing cannot drift apart, and
   * an operation called by another gets its own nested span — its duration is
   * its own.
   *
   * The implementation brings the tracer, the way it brings pino: core knows
   * neither. A failure marks the span and goes out unchanged — what to report
   * stays the caller's decision.
   */
  withChildSpan<Result>(
    scope: ScopeName,
    run: (logger: Logger) => Promise<Result>
  ): Promise<Result>
  debug(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  /** An anomaly without an `Error`: no stack, so nothing to capture. */
  warn(message: string, meta?: LogMeta): void
  /** An `Error` when one was caught: it keeps its stack in the log, and is the only thing worth capturing. */
  warn(error: Error, meta?: LogMeta, options?: LogOptions): void
  /** Requires an `Error`: a message alone can be neither located nor deduplicated. */
  error(error: Error, meta?: LogMeta, options?: LogOptions): void
  /** Like `error`, for failures the process cannot continue after. */
  fatal(error: Error, meta?: LogMeta, options?: LogOptions): void
}
