import { spanDecorator } from './with-span.ts'

/** The levels a logger writes, quietest first. `LogLevel` derives from the list,
 * so a level cannot be added to one without the other. */
export const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

/** How much a runtime says: a level, or `silent`. Not a level itself — naming
 * it apart is what told `LogSetting` from `LogLevel`. */
export const LOG_VERBOSITIES = [...LOG_LEVELS, 'silent'] as const

export type LogVerbosity = (typeof LOG_VERBOSITIES)[number]

/** Layers a unit can belong to. Widening this list is deliberate: the values
 * end up in searches and alerts. */
export type ScopeLayer =
  /** Server-side work, whether it is the boundary that validates what came in
   * and calls the service or the work a route reaches. The site files both
   * under `actions/` and `services/`; what triggers it from the browser is an
   * `interaction`, never an `action`. */
  | 'action'
  /** The model being evaluated on the client (publicodes). On the server, the
   * same work belongs to a `service` in `core`, an `action` in `site`. */
  | 'engine'
  /** Server-side work in the `core` workspace, whose layer list the site does
   * not share: there, the same work is an `action`. */
  | 'service'
  | 'middleware'
  | 'instrumentation'
  /** Behaviour in the browser, where a `view` returns markup: an event handler,
   * a hook, an effect. Includes an effect that reaches a server action — that
   * call's own failure is the `action`'s line, not this one. */
  | 'interaction'
  /** A unit that renders: page, layout, error boundary. */
  | 'view'
  | 'sideEffect'
  /** A scheduled task: one run, then it exits. One scope per task. */
  | 'cron'
  /** The loop that consumes jobs: one scope per iteration. */
  | 'worker'

/** Workspaces that emit telemetry. */
export type ScopePackage = 'core' | 'site'

/** `<package>.<layer>.<unit>`, e.g. `core.service.engineRegistry`. The shape is
 * compiler-enforced; uniqueness across units is a review rule, and the site has
 * no `service` layer. */
export type ScopeName =
  | `core.${ScopeLayer}.${string}`
  | `site.${Exclude<ScopeLayer, 'service'>}.${string}`

/** Attributes another party named, kept unprefixed (`process.memory.usage`).
 * Ours carry `ngc.` (semconv reserves unprefixed names). */
export type OtelAttributes = Partial<{
  'error.type': string
  'exception.type': string
  'exception.message': string
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

/** Line attributes. Never PII. Scalars query best; structured values become
 * JSON text. Keys are open — the transport prefixes them. */
export type LogMeta = Record<string, unknown> & {
  /**
   * Qualified name of the emitting unit, enforced: a bare name would not
   * compile.
   */
  scope?: ScopeName
}

/** Static context merged into every line of a child logger. */
export type LogBindings = LogMeta

/**
 * What a span attribute accepts: the scalars OTLP defines. Anything structured
 * belongs in a line, where it is flattened and stays queryable.
 */
export type SpanAttributeValue = string | number | boolean

/**
 * What the span and the lines of an operation carry about it, picked from the
 * service's own parameters: a list of keys, or a function that builds them.
 *
 * A list is checked against the parameters and cannot rename; a function is the
 * way to rename (`({ id }) => ({ simulationId: id })`) or to mask before
 * binding.
 */
/** The parameters a decorated service is called with: its own, without the
 * logger the decorator merges in. */
export type WithoutLogger<Params> = Params extends unknown
  ? Omit<Params, 'logger'>
  : never

/** The decorated service: takes no argument when nothing is left to pass. */
export type DecoratedService<Params, Result> =
  keyof WithoutLogger<Params> extends never
    ? () => Promise<Result>
    : (params: WithoutLogger<Params>) => Promise<Result>

/** What the span and the lines carry: the parameters to take as they are, or a
 * function that builds them to rename or mask. */
export type SpanBindings<Params> =
  | readonly (Exclude<keyof Params, 'logger'> & string)[]
  | ((params: Params) => LogMeta)

export interface Logger {
  /**
   * New logger with `bindings` merged into every line. Does not mutate the
   * parent.
   */
  child(bindings: LogBindings): Logger
  /** Decorates a parameterless service: each call runs in its own span.
   *
   * @param scope The operation's name, `<package>.<layer>.<unit>`.
   * @param service The body, taking `{ logger }`.
   * @returns The service to call, taking no argument.
   * @example logger.withSpan('site.action.getUserSession', async ({ logger }) => …)
   */
  withSpan<Result>(
    scope: ScopeName,
    service: (params: { logger: Logger }) => Promise<Result>
  ): () => Promise<Result>
  /** Decorates a service that takes parameters, binding none of them.
   *
   * @param scope The operation's name, e.g. `site.action.login`.
   * @param service The body: the caller's parameters, plus `logger`.
   * @returns The service to call, without `logger`.
   * @example logger.withSpan('site.action.login', async ({ email, logger }) => …)
   */
  withSpan<Params extends object, Result>(
    scope: ScopeName,
    service: (params: Params) => Promise<Result>
  ): DecoratedService<Params, Result>
  /** Decorates a service, binding the parameters that name the operation: on
   * the span as on every line, so one filter reads both.
   *
   * @param scope The operation's name, e.g. `core.service.completeSimulation`.
   * @param bindings The keys to take as they are (`['simulationId']`), or a
   * function that builds them (`({ id }) => ({ simulationId: id })`).
   * @param service The body: the caller's parameters, plus `logger`.
   * @returns The service to call, without `logger`.
   * @example logger.withSpan('core.service.completeSimulation', ['simulationId'], …)
   */
  withSpan<Params extends object, Result>(
    scope: ScopeName,
    bindings: SpanBindings<Params>,
    service: (params: Params) => Promise<Result>
  ): DecoratedService<Params, Result>
  /** Annotates the span with a measurement (size, branch taken). Only for
   * values unknown before the span opens; known values go in `child` bindings. */
  setSpanAttribute(key: string, value: SpanAttributeValue): void
  debug(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  /** An anomaly without an `Error`: no stack, so nothing to capture. */
  warn(message: string, meta?: LogMeta): void
  /** An `Error` when caught: keeps its stack. `warn` never reports — a handled
   * anomaly is a line, not an issue. */
  warn(error: Error, meta?: LogMeta): void
  /**
   * Requires an `Error`: a message alone can be neither located nor
   * deduplicated. Always reported: the line and the capture are one event seen
   * by two products, and a failure another net already reported is silenced by
   * that net, not at the call site.
   */
  error(error: Error, meta?: LogMeta): void
  /** Like `error`, for failures the process cannot continue after. */
  fatal(error: Error, meta?: LogMeta): void
}

/**
 * A logger that swallows everything: the default for a caller that does not
 * want to hear about a step.
 */
const noopChild = () => noopLogger

export const noopLogger: Logger = {
  child: noopChild,
  withSpan: spanDecorator((_scope, run) => run(noopLogger)),
  setSpanAttribute: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
}
