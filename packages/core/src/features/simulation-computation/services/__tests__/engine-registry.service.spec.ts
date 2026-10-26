import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { failure, success } from '../../../../lib/result.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ModelFileFetchFailedError } from '../../../models/errors.ts'
import { CURRENT_MODEL_VERSION } from '../../../models/helpers/model-versions.ts'
import type { Model, ModelRegion } from '../../../models/types/model.ts'

const noopLogger = createTestLogger()

// A rule set small enough to keep the tests instant - the point of these is
// the cache behaviour, not what publicodes makes of the rules.
const STUB_RULES = { bilan: { formule: 0 } }

const stubGetModelRules = vi.fn().mockResolvedValue(success(STUB_RULES))

// The registry instantiates createGetModelRules itself; stub the module so
// the tests never load the model package or hit the network.
vi.mock('../../../models/services/get-model-rules.service.ts', () => ({
  createGetModelRules: () => stubGetModelRules,
}))

describe('engine-registry.service', () => {
  const ORIGINAL_ENV = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    stubGetModelRules.mockReset()
    stubGetModelRules.mockResolvedValue(success(STUB_RULES))
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('warms up the configured hot keys and reuses the same engine instance', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current'
    const { createWarmUpHotEngines, createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    await createWarmUpHotEngines({
      logger: noopLogger,
    })()

    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })
    const engineA = await getEngine(model('FR'))
    const engineB = await getEngine(model('FR'))
    expect(engineA).toBe(engineB)
  })

  it('ignores locale and reuses the same engine for fr and en models', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

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
    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

    const fr = await getEngine(model('FR'))
    await getEngine(model('UK'))
    // Cache is now full (FR, UK); building a third combo evicts FR (least
    // recently used, since UK was accessed after FR).
    await getEngine(model('BE'))

    const frRebuilt = await getEngine(model('FR'))
    expect(frRebuilt).not.toBe(fr)
  })

  it('refreshes recency on an lru cache hit so the entry survives the next eviction', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    process.env.ENGINE_CACHE_MAX_SIZE = '2'
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

    const fr = await getEngine(model('FR'))
    const uk = await getEngine(model('UK'))
    // Re-access FR so it becomes the most recently used; UK is now the LRU.
    await getEngine(model('FR'))
    // Building a third combo evicts UK (the LRU), not FR.
    await getEngine(model('BE'))

    // FR survived the eviction (still the cached instance)...
    const frAgain = await getEngine(model('FR'))
    expect(frAgain).toBe(fr)
    // ...while UK was evicted and rebuilt.
    const ukRebuilt = await getEngine(model('UK'))
    expect(ukRebuilt).not.toBe(uk)
  })

  it('still caches the just-built engine when ENGINE_CACHE_MAX_SIZE is 0', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    process.env.ENGINE_CACHE_MAX_SIZE = '0'
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

    const first = await getEngine(model('FR'))
    const second = await getEngine(model('FR'))
    expect(second).toBe(first)
    expect(stubGetModelRules).toHaveBeenCalledOnce()
  })

  it('builds an engine for an older published version', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

    const engine = await getEngine({
      region: 'FR',
      locale: 'fr',
      version: { publishedTag: '4.14.2' },
    })

    expect(engine).toBeDefined()
    expect(stubGetModelRules).toHaveBeenCalledWith({
      region: 'FR',
      locale: 'fr',
      version: { publishedTag: '4.14.2' },
    })
  })

  it('builds an engine for a PR version', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

    await getEngine({
      region: 'FR',
      locale: 'fr',
      version: { PRNumber: '42' },
    })

    expect(stubGetModelRules).toHaveBeenCalledWith({
      region: 'FR',
      locale: 'fr',
      version: { PRNumber: '42' },
    })
  })

  it('caches a remotely retrieved version under its own key', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    process.env.ENGINE_CACHE_MAX_SIZE = '2'
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const logger = createTestLogger()
    const getEngine = createGetEngineForModel({
      logger,
    })

    const outdated = { publishedTag: '4.14.2' } as const
    const first = await getEngine({
      region: 'FR',
      locale: 'fr',
      version: outdated,
    })
    const second = await getEngine({
      region: 'FR',
      locale: 'fr',
      version: outdated,
    })

    expect(second).toBe(first)
    expect(stubGetModelRules).toHaveBeenCalledOnce()
    expect(logger.debug).toHaveBeenCalledWith(
      'lru cache hit',
      expect.objectContaining({ key: 'FR-fr-4.14.2' })
    )
  })

  it('rejects when getModelRules returns a failure', async () => {
    process.env.ENGINE_HOT_KEYS = ''
    stubGetModelRules.mockResolvedValue(
      failure(
        new ModelFileFetchFailedError({
          message: '404',
          url: 'https://example.com/model.json',
          status: 404,
        })
      )
    )
    const { createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

    await expect(
      getEngine({
        region: 'FR',
        locale: 'fr',
        version: { publishedTag: '0.0.1' },
      })
    ).rejects.toThrow('404')
  })

  it('warms up every entry in ENGINE_HOT_KEYS', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current,UK:current'
    const { createWarmUpHotEngines, createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    await createWarmUpHotEngines({
      logger: noopLogger,
    })()
    expect(stubGetModelRules).toHaveBeenCalledTimes(2)

    const getEngine = createGetEngineForModel({
      logger: noopLogger,
    })

    const frEngine = await getEngine(model('FR'))
    const ukEngine = await getEngine(model('UK'))
    // Both are served from the hot set, so neither triggers a new build.
    expect(stubGetModelRules).toHaveBeenCalledTimes(2)
    expect(frEngine).not.toBe(ukEngine)
  })

  it('rejects when getModelRules returns a failure during warm-up', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current'
    stubGetModelRules.mockResolvedValue(
      failure(
        new ModelFileFetchFailedError({
          message: 'boom',
          url: 'https://example.com/model.json',
        })
      )
    )
    const { createWarmUpHotEngines } =
      await import('../engine-registry.service.ts')

    await expect(
      createWarmUpHotEngines({
        logger: noopLogger,
      })()
    ).rejects.toThrow('boom')
  })

  it('rejects an invalid ENGINE_HOT_KEYS entry at module load', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current,ZZ:current'
    await expect(import('../engine-registry.service.ts')).rejects.toThrow()
  })

  it('logs hot engine warm-up via the injected logger', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current'
    const { createWarmUpHotEngines } =
      await import('../engine-registry.service.ts')
    const logger = createTestLogger()

    await createWarmUpHotEngines({ logger })()

    expect(logger.debug).toHaveBeenCalledWith(
      'warming hot engine',
      expect.objectContaining({ key: `FR-fr-${CURRENT_MODEL_VERSION}` })
    )
    expect(logger.info).toHaveBeenCalledWith(
      'hot engines warmed',
      expect.objectContaining({ count: 1 })
    )
  })

  it('logs a hot engine hit, a cache miss/build, and the resulting lru size via the injected logger', async () => {
    process.env.ENGINE_HOT_KEYS = 'FR:current'
    process.env.ENGINE_CACHE_MAX_SIZE = '5'
    const { createWarmUpHotEngines, createGetEngineForModel } =
      await import('../engine-registry.service.ts')
    const logger = createTestLogger()

    await createWarmUpHotEngines({ logger })()
    const getEngine = createGetEngineForModel({
      logger,
    })

    await getEngine(model('FR'))
    expect(logger.debug).toHaveBeenCalledWith(
      'hot engine hit',
      expect.objectContaining({ key: `FR-fr-${CURRENT_MODEL_VERSION}` })
    )

    await getEngine(model('UK'))
    expect(logger.debug).toHaveBeenCalledWith(
      'cache miss, building engine',
      expect.objectContaining({ key: `UK-fr-${CURRENT_MODEL_VERSION}` })
    )
    expect(logger.debug).toHaveBeenCalledWith(
      'engine built',
      expect.objectContaining({ key: `UK-fr-${CURRENT_MODEL_VERSION}` })
    )
    expect(logger.debug).toHaveBeenCalledWith(
      'lru cache size',
      expect.objectContaining({ lruSize: 1 })
    )

    await getEngine(model('UK'))
    expect(logger.debug).toHaveBeenCalledWith(
      'lru cache hit',
      expect.objectContaining({
        key: `UK-fr-${CURRENT_MODEL_VERSION}`,
        lruSize: 1,
      })
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
