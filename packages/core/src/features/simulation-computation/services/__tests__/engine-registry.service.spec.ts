import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Model, ModelRegion } from '../../../simulations/types/model.ts'
import { CURRENT_MODEL_VERSION } from '../../model-support/model-versions.ts'

const noopLogger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
}

// Every test resets the module registry to get fresh hot/lru maps, so each one
// parses the real model JSON into a new Engine - the eviction test does it four
// times. That costs ~1s in isolation, but these are CPU-bound parses competing
// with the rest of the suite, and under that contention the 5s default is not
// enough. Raised here rather than globally so other specs still fail fast.
vi.setConfig({ testTimeout: 20_000 })

describe('engine-registry.service', () => {
  const ORIGINAL_ENV = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('warms up the configured hot keys and reuses the same engine instance', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current'
    const { createWarmUpHotEngines, createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    await createWarmUpHotEngines({ logger: noopLogger })()

    const getEngine = createGetEngineForModel({ logger: noopLogger })
    const engineA = await getEngine(model('FR'))
    const engineB = await getEngine(model('FR'))
    expect(engineA).toBe(engineB)
  })

  it('ignores locale and reuses the same engine for fr and en models', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({ logger: noopLogger })

    const frEngine = await getEngine(model('FR'))
    const enEngine = await getEngine({
      ...model('FR'),
      locale: 'en',
    })
    expect(enEngine).toBe(frEngine)
  })

  it('evicts the least recently used non-hot engine once the cache is full', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    process.env.ENGINE_CACHE_MAX_SIZE = '2'
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({ logger: noopLogger })

    const fr = await getEngine(model('FR'))
    await getEngine(model('UK'))
    // Cache is now full (FR, UK); building a third combo evicts FR (least
    // recently used, since UK was accessed after FR).
    await getEngine(model('BE'))

    const frRebuilt = await getEngine(model('FR'))
    expect(frRebuilt).not.toBe(fr)
  })

  it('throws for a model version that is neither current nor previous', async () => {
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({ logger: noopLogger })

    await expect(
      getEngine({
        region: 'FR',
        locale: 'fr',
        version: { publishedTag: '0.0.1' },
      })
    ).rejects.toThrow()
  })

  it('logs hot engine warm-up via the injected logger', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current'
    const { createWarmUpHotEngines } =
      await import('../engine-registry.service.ts')
    const logger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }

    await createWarmUpHotEngines({ logger })()

    expect(logger.info).toHaveBeenCalledWith(
      '[engine-registry] warming hot engine',
      expect.objectContaining({ key: 'FR:current' })
    )
    expect(logger.info).toHaveBeenCalledWith(
      '[engine-registry] hot engines warmed',
      expect.objectContaining({ count: 1 })
    )
  })

  it('logs a hot engine hit, a cache miss/build, and the resulting lru size via the injected logger', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current'
    process.env.ENGINE_CACHE_MAX_SIZE = '5'
    const { createWarmUpHotEngines, createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const logger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }

    await createWarmUpHotEngines({ logger })()
    const getEngine = createGetEngineForModel({ logger })

    await getEngine(model('FR'))
    expect(logger.debug).toHaveBeenCalledWith(
      '[engine-registry] hot engine hit',
      expect.objectContaining({ key: 'FR:current' })
    )

    await getEngine(model('UK'))
    expect(logger.debug).toHaveBeenCalledWith(
      '[engine-registry] cache miss, building engine',
      expect.objectContaining({ key: 'UK:current' })
    )
    expect(logger.debug).toHaveBeenCalledWith(
      '[engine-registry] engine built',
      expect.objectContaining({ key: 'UK:current' })
    )
    expect(logger.debug).toHaveBeenCalledWith(
      '[engine-registry] lru cache size',
      expect.objectContaining({ lruSize: 1 })
    )

    await getEngine(model('UK'))
    expect(logger.debug).toHaveBeenCalledWith(
      '[engine-registry] lru cache hit',
      expect.objectContaining({ key: 'UK:current', lruSize: 1 })
    )
  })
})

function model(region: ModelRegion): Model {
  return {
    region,
    locale: 'fr',
    version: { publishedTag: CURRENT_MODEL_VERSION },
  }
}
