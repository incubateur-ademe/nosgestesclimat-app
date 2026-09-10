import type { RawPublicodes } from 'publicodes'
import Engine from 'publicodes'
import { match } from 'ts-pattern'
import * as v from 'valibot'
import { currentMemoryMB } from '../../../lib/memory.ts'
import type { Logger } from '../../logger/index.ts'
import type { Model, ModelRegion } from '../../simulations/types/model.ts'
import { UnsupportedModelError } from '../errors/simulation-computation.error.ts'
import type { HotKey } from '../model-support/hot-key.schema.ts'
import { HotKeySchema } from '../model-support/hot-key.schema.ts'
import type { ModelVersionKind } from '../model-support/model-versions.ts'
import { resolveVersionKind } from '../model-support/resolve-version-kind.ts'

const ENGINE_OPTIONS = {
  strict: { situation: false, noOrphanRule: false },
  logger: {
    log: () => {},
    warn: () => {},
    error: console.error,
  },
} as const

interface EngineRegistryDeps {
  logger: Logger
}

/**
 * Combinations kept warm at all times, built eagerly by warmUpHotEngines()
 * and never evicted. Comma-separated `<region>:<versionKind>` keys.
 * Defaults to the busiest combination only (~205MB total RSS with worker
 * deps included - see MAX_CACHE_SIZE below), which is what a 256MB review
 * app container can safely hold. Production overrides this via env var to
 * also warm ED:current, on a bigger container.
 */
const HOT_KEYS = new Map<string, HotKey>(
  (process.env.ENGINE_HOT_KEYS ?? 'FR:current')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
    .map((key) => v.parse(HotKeySchema, key))
    .map((hotKey) => [engineKey(hotKey.region, hotKey.versionKind), hotKey])
)

/**
 * Max number of non-hot engines kept in the LRU cache at once.
 * Defaults to 1 (hot set + currently used lazy engine)
 * so a small sized container never OOMs on a burst of rare region/version requests.
 * Production should raise this via env once its container is sized for it.
 *
 * Measured RSS deltas, not a flat per-engine cost:
 * worker deps loaded but no engine ~110MB;
 * +FR ~95MB (first engine also pays a one-time publicodes/V8 warmup cost);
 * +ED ~20-60MB;
 * A single FR:current hot engine alone already sits close to 256MB total RSS.
 */
const MAX_CACHE_SIZE =
  Math.max(Number(process.env.ENGINE_CACHE_MAX_SIZE), 1) || 1

const hotEngines = new Map<string, Engine>()
// Map preserves insertion order; re-inserting a key on access moves it to
// the end, so the first key is always the least recently used one.
const lruCache = new Map<string, Engine>()

/**
 * Rule sets are only published in French, and locale does not affect
 * computed values (only rule labels do) so every engine is built from the
 * fr rules regardless of the simulation's own locale.
 *
 * Prefer almost hardcoded dynamic imports in case we move to bundling
 */
async function loadRules(
  region: ModelRegion,
  versionKind: ModelVersionKind
): Promise<RawPublicodes<string>> {
  const importModel = match(versionKind)
    .with(
      'current',
      () => () =>
        import(
          `@incubateur-ademe/nosgestesclimat/public/co2-model.${region}-lang.fr.json`,
          {
            with: { type: 'json' },
          }
        )
    )
    .with(
      'previous',
      () => () =>
        import(
          `@incubateur-ademe/nosgestesclimat-previous/public/co2-model.${region}-lang.fr.json`,
          {
            with: { type: 'json' },
          }
        )
    )
    .exhaustive()

  const module = await importModel()
  return module.default
}

const buildEngine = async (
  region: ModelRegion,
  versionKind: ModelVersionKind
): Promise<Engine> => {
  const rules = await loadRules(region, versionKind)
  const engine = new Engine(rules, ENGINE_OPTIONS)
  return engine
}

/**
 * Builds and pins the hot-set engines so the first jobs for the busiest
 * combinations never pay the cold-build cost. Call once at worker startup.
 */
export function createWarmUpHotEngines(deps: EngineRegistryDeps) {
  return async function warmUpHotEngines(): Promise<void> {
    const { logger } = deps
    logger.debug('[engine-registry] warming all hot engines', {
      ...currentMemoryMB(),
    })
    for (const [key, { region, versionKind }] of HOT_KEYS) {
      logger.info('[engine-registry] warming hot engine', {
        key,
        region,
        versionKind,
      })
      hotEngines.set(key, await buildEngine(region, versionKind))
      logger.debug('[engine-registry] hot engine warmed', {
        region,
        versionKind,
        ...currentMemoryMB(),
      })
    }
    logger.info('[engine-registry] hot engines warmed', {
      count: hotEngines.size,
      ...currentMemoryMB(),
    })
  }
}

/**
 * Returns the engine for a simulation's model, pulling from the hot set,
 * then the LRU cache, then lazily building (and caching) a new one.
 */
export function createGetEngineForModel(deps: EngineRegistryDeps) {
  return async function getEngineForModel(model: Model): Promise<Engine> {
    const { logger } = deps
    const versionKind = resolveVersionKind(model)
    if (versionKind === null) {
      throw new UnsupportedModelError(model)
    }

    const key = engineKey(model.region, versionKind)

    const hotEngine = hotEngines.get(key)
    if (hotEngine) {
      logger.debug('[engine-registry] hot engine hit', { key })
      return hotEngine
    }

    const cachedEngine = lruCache.get(key)
    if (cachedEngine) {
      logger.debug('[engine-registry] lru cache hit', {
        key,
        lruSize: lruCache.size,
      })
      // Refresh recency by moving the entry to the end.
      lruCache.delete(key)
      lruCache.set(key, cachedEngine)
      return cachedEngine
    }

    // Clean up before building a new engine to avoid double memory footprint
    if (lruCache.size >= MAX_CACHE_SIZE) {
      const leastRecentlyUsedKey = lruCache.keys().next().value
      if (leastRecentlyUsedKey) {
        lruCache.delete(leastRecentlyUsedKey)
        logger.debug('[engine-registry] lru cache evicted', {
          evictedKey: leastRecentlyUsedKey,
          ...currentMemoryMB(),
        })
      }
    }

    logger.debug('[engine-registry] cache miss, building engine', { key })
    const engine = await buildEngine(model.region, versionKind)
    logger.debug('[engine-registry] engine built', {
      key,
      ...currentMemoryMB(),
    })

    // if MAX_CACHE_SIZE is 0 it still means lruSize of 1
    // since the current lazy loaded model needs to be cached in order for it to be accessed later
    lruCache.set(key, engine)

    logger.debug('[engine-registry] lru cache size', { lruSize: lruCache.size })

    return engine
  }
}

function engineKey(region: ModelRegion, versionKind: ModelVersionKind): string {
  return `${region}:${versionKind}`
}
