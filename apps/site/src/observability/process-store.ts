/** A value shared across every copy of a module in the process. Next builds
 * each entry into its own chunk with its own module instances; `Symbol.for`
 * on `globalThis` is the anchor (same pattern as the OTel API). */
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
