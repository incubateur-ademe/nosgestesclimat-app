import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import type { Model } from '../../types/model.ts'
import { createResolvePublicRules } from '../resolve-public-rules.service.ts'

const modelOf = (
  publishedTag: string,
  locale: Model['locale'] = 'fr'
): Model => ({ locale, region: 'FR', version: { publishedTag } })

const findRules = () =>
  prisma.rule.findMany({
    select: {
      id: true,
      name: true,
      metric: true,
      title: true,
      description: true,
    },
    orderBy: [{ name: 'asc' }, { metric: 'asc' }],
  })

/** A model's rules, its public rule worded with `titre`. */
const engineTitled = (titre: string) =>
  createTestEngine({
    'footprint . described': { public: 'oui', titre, valeur: 1 },
  })

describe('resolvePublicRules', () => {
  let resolvePublicRules: ReturnType<typeof createResolvePublicRules>

  beforeEach(() => {
    // A fresh resolver per test: its cache would outlive the emptied database.
    resolvePublicRules = createResolvePublicRules()
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('stores each public rule for every metric with its French title and description, and returns them', async () => {
    const rules = await resolvePublicRules(
      createTestEngine({
        'footprint . described': {
          public: 'oui',
          titre: 'Transport',
          description: 'Les trajets du quotidien',
          valeur: 1,
        },
        'footprint . bare': { public: 'oui', valeur: 1 },
      }),
      modelOf('1.0.0')
    )

    const stored = await findRules()
    expect(stored).toEqual([
      {
        id: expect.any(Number),
        name: 'footprint . bare',
        metric: 'carbon',
        title: null,
        description: null,
      },
      {
        id: expect.any(Number),
        name: 'footprint . bare',
        metric: 'water',
        title: null,
        description: null,
      },
      {
        id: expect.any(Number),
        name: 'footprint . described',
        metric: 'carbon',
        title: 'Transport',
        description: 'Les trajets du quotidien',
      },
      {
        id: expect.any(Number),
        name: 'footprint . described',
        metric: 'water',
        title: 'Transport',
        description: 'Les trajets du quotidien',
      },
    ])
    expect(rules).toHaveLength(stored.length)
    expect(rules).toEqual(
      expect.arrayContaining(
        stored.map(({ id, name, metric }) => ({ id, name, metric }))
      )
    )
  })

  it('ignores the rules not marked public', async () => {
    const rules = await resolvePublicRules(
      createTestEngine({
        'footprint . public': { public: 'oui', valeur: 1 },
        'footprint . private': { valeur: 2 },
        'footprint . explicitly private': { public: 'non', valeur: 3 },
      }),
      modelOf('1.0.0')
    )

    expect(rules.map(({ name }) => name)).toEqual([
      'footprint . public',
      'footprint . public',
    ])
    expect(await prisma.rule.count()).toBe(2)
  })

  it('stores nothing when the model has no public rules', async () => {
    const rules = await resolvePublicRules(
      createTestEngine({ 'footprint . private': { valeur: 1 } }),
      modelOf('1.0.0')
    )

    expect(rules).toEqual([])
    expect(await prisma.rule.count()).toBe(0)
  })

  it('reuses the rules of a model already resolved', async () => {
    const first = await resolvePublicRules(
      engineTitled('Transport'),
      modelOf('1.0.0')
    )
    // Same model: its rules are not read again, the wording is unchanged.
    const second = await resolvePublicRules(
      engineTitled('Mobilité'),
      modelOf('1.0.0')
    )

    expect(second).toEqual(first)
    expect(await findRules()).toEqual([
      expect.objectContaining({ metric: 'carbon', title: 'Transport' }),
      expect.objectContaining({ metric: 'water', title: 'Transport' }),
    ])
  })

  it('reuses the rules of the same model in another locale', async () => {
    const french = await resolvePublicRules(
      engineTitled('Transport'),
      modelOf('1.0.0', 'fr')
    )
    // Locales share the fr rules: the rules are not read again.
    const english = await resolvePublicRules(
      engineTitled('Mobilité'),
      modelOf('1.0.0', 'en')
    )

    expect(english).toEqual(french)
    expect(await findRules()).toEqual([
      expect.objectContaining({ metric: 'carbon', title: 'Transport' }),
      expect.objectContaining({ metric: 'water', title: 'Transport' }),
    ])
  })

  it('refreshes the title and description when a new model is first resolved, keeping the rule ids', async () => {
    const first = await resolvePublicRules(
      createTestEngine({
        'footprint . described': {
          public: 'oui',
          titre: 'Transport',
          description: 'Les trajets',
          valeur: 1,
        },
      }),
      modelOf('1.0.0')
    )
    const second = await resolvePublicRules(
      engineTitled('Mobilité'),
      modelOf('1.1.0')
    )

    expect(second).toEqual(first)
    expect(await findRules()).toEqual([
      expect.objectContaining({
        metric: 'carbon',
        title: 'Mobilité',
        description: null,
      }),
      expect.objectContaining({
        metric: 'water',
        title: 'Mobilité',
        description: null,
      }),
    ])
  })

  // PGlite has a single connection, so the two resolutions interleave rather
  // than truly race: this proves the upsert is idempotent across separate
  // resolver caches, not that concurrent transactions are safe.
  it('resolves the same Rule rows from two resolvers with separate caches', async () => {
    const engine = engineTitled('Transport')

    // One resolver per worker process, each with its own cache.
    const [first, second] = await Promise.all([
      createResolvePublicRules()(engine, modelOf('1.0.0')),
      createResolvePublicRules()(engine, modelOf('1.0.0')),
    ])

    expect(await prisma.rule.count()).toBe(2)
    expect(second).toEqual(first)
  })

  // The model marks its public rules with an attribute publicodes does not
  // know: it must reach the parsed rules for them to be found.
  it('keeps `public: oui` on the parsed rules', () => {
    const rules: RawPublicodes<string> = {
      'footprint . transport': { public: 'oui', valeur: 1 },
    }
    const parsedRules = createTestEngine(rules).getParsedRules()

    expect(parsedRules['footprint . transport'].rawNode.public).toBe('oui')
  })
})
