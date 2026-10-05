/**
 * A value shared by every copy of a module in the process.
 *
 * Next builds each entry — the proxy, the instrumentation, every route, the
 * SSR pass — into its own chunk, and a chunk instantiates the modules it
 * embeds: a module-level `Map` is not one map, it is one per entry. The
 * OpenTelemetry API hit the same wall and anchors its registries on
 * `globalThis` under a `Symbol.for` key, which is why a provider registered in
 * one entry serves the spans of all the others. Everything the request spans
 * share takes the same route.
 */
const STORES = Symbol.for('ngc.observability.stores')

/**
 * The value filed under `key`, created on first use in the process: `create`
 * runs once, whichever entry gets there first.
 */
export function processStore<Value>(key: string, create: () => Value): Value {
  // The one place the cast is unavoidable: nothing types the properties a
  // Turbopack runtime puts on the global object either.
  const holder = globalThis as unknown as Record<
    symbol,
    Record<string, unknown> | undefined
  >
  const stores = (holder[STORES] ??= {})

  stores[key] ??= create()

  return stores[key] as Value
}
