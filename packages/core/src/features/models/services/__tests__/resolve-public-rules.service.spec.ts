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

/** The model's root, outside the public contract: this engine has no footprint. */
const PRIVATE_BILAN = { bilan: { public: 'non', valeur: 1 } } as const

/** A model's rules, its public rule worded with `titre`. */
const engineTitled = (titre: string) =>
  createTestEngine({
    ...PRIVATE_BILAN,
    'footprint . described': { public: 'oui', titre, valeur: 1 },
  })

/**
 * A model whose footprint sums two categories, one of which sums two
 * subcategories, next to a public rule the footprint does not sum.
 */
const footprintEngine = () =>
  createTestEngine({
    bilan: { public: 'oui', formule: { somme: ['transport', 'food'] } },
    transport: {
      public: 'oui',
      titre: 'Transport',
      formule: { somme: ['voiture', 'train'] },
    },
    'transport . voiture': { public: 'oui', valeur: 1 },
    'transport . train': { public: 'oui', valeur: 1 },
    food: { public: 'oui', formule: { somme: ['repas'] } },
    'food . repas': { public: 'oui', valeur: 1 },
    'footprint . other': { public: 'oui', valeur: 2 },
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

  it('stores each public rule once without a metric, with its French title and description, and returns them', async () => {
    const rules = await resolvePublicRules(
      createTestEngine({
        ...PRIVATE_BILAN,
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
        metric: null,
        title: null,
        description: null,
      },
      {
        id: expect.any(Number),
        name: 'footprint . described',
        metric: null,
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

  it('stores the footprint, its categories and their subcategories for every metric, and every other rule without one', async () => {
    const rules = await resolvePublicRules(footprintEngine(), modelOf('1.0.0'))

    const stored = await findRules()
    expect(stored).toEqual(
      [
        { name: 'bilan', metric: 'carbon', title: null },
        { name: 'bilan', metric: 'water', title: null },
        { name: 'food', metric: 'carbon', title: null },
        { name: 'food', metric: 'water', title: null },
        { name: 'food . repas', metric: 'carbon', title: null },
        { name: 'food . repas', metric: 'water', title: null },
        { name: 'footprint . other', metric: null, title: null },
        { name: 'transport', metric: 'carbon', title: 'Transport' },
        { name: 'transport', metric: 'water', title: 'Transport' },
        { name: 'transport . train', metric: 'carbon', title: null },
        { name: 'transport . train', metric: 'water', title: null },
        { name: 'transport . voiture', metric: 'carbon', title: null },
        { name: 'transport . voiture', metric: 'water', title: null },
      ].map((rule) => ({ ...rule, id: expect.any(Number), description: null }))
    )
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
        ...PRIVATE_BILAN,
        'footprint . public': { public: 'oui', valeur: 1 },
        'footprint . private': { valeur: 2 },
        'footprint . explicitly private': { public: 'non', valeur: 3 },
      }),
      modelOf('1.0.0')
    )

    expect(rules.map(({ name }) => name)).toEqual(['footprint . public'])
    expect(await prisma.rule.count()).toBe(1)
  })

  it('stores nothing when the model has no public rules', async () => {
    const rules = await resolvePublicRules(
      createTestEngine({
        ...PRIVATE_BILAN,
        'footprint . private': { valeur: 1 },
      }),
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
      expect.objectContaining({ metric: null, title: 'Transport' }),
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
      expect.objectContaining({ metric: null, title: 'Transport' }),
    ])
  })

  it('refreshes the title and description when a new model is first resolved, keeping the rule ids', async () => {
    const first = await resolvePublicRules(
      createTestEngine({
        ...PRIVATE_BILAN,
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
        metric: null,
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

    expect(await prisma.rule.count()).toBe(1)
    expect(second).toEqual(first)
  })
})
