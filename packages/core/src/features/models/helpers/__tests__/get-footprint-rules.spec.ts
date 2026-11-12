import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import { utils } from 'publicodes'
import { beforeAll, describe, expect, it } from 'vitest'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { MissingFootprintRuleError } from '../../errors.ts'
import { getFootprintRules, ROOT_DOTTED_NAME } from '../get-footprint-rules.ts'
import { getModelFileName } from '../get-model-file-name.ts'
import { getSomme } from '../get-somme.ts'
import { importCurrentModel } from '../import-current-model.ts'

/** The categories the installed model's `bilan` sums. */
const EXPECTED_CATEGORIES: DottedName[] = [
  'logement',
  'transport',
  'alimentation',
  'divers',
  'services sociétaux',
]

const MODEL_METRICS = ['carbone', 'eau'] as const

/**
 * The sums a category declares, including every branch of a `variations`.
 * `getSomme` returns only the first branch; the footprint collection must not
 * miss a subcategory that only a later branch declares.
 */
const allSums = (rawNode: unknown): DottedName[][] => {
  if (!rawNode || typeof rawNode !== 'object') return []

  const rule = rawNode as Record<string, unknown>
  const formula = rule.formule
  const definition =
    formula && typeof formula === 'object'
      ? (formula as Record<string, unknown>)
      : rule

  if (Array.isArray(definition.somme)) {
    return [definition.somme as DottedName[]]
  }

  if (Array.isArray(definition.variations)) {
    return (
      definition.variations as Array<{ alors?: { somme?: DottedName[] } }>
    ).flatMap(({ alors }) => (alors?.somme ? [alors.somme] : []))
  }

  return []
}

describe('getFootprintRules', () => {
  it('throws an explicit error when the model has no bilan', () => {
    const engine = createTestEngine({ 'footprint . other': { valeur: 1 } })

    expect(() => getFootprintRules(engine)).toThrow(MissingFootprintRuleError)
    expect(() => getFootprintRules(engine)).toThrow(/no "bilan" rule/)
  })
})

/**
 * The server relies on the model's structure to store the footprint rules for
 * both metrics. This contract fails when the installed model changes that
 * structure, before a simulation runs into it.
 */
describe('getFootprintRules on the installed model', () => {
  let engine: Engine
  let parsedRules: ReturnType<Engine['getParsedRules']>
  let categories: DottedName[]
  let subcategories: DottedName[]

  beforeAll(async () => {
    engine = createTestEngine(
      await importCurrentModel(
        getModelFileName({ region: 'FR', locale: 'fr', isOptim: false })
      )
    )
    parsedRules = engine.getParsedRules()
    ;({ categories, subcategories } = getFootprintRules(engine))
  }, 60_000)

  it('reads the categories the bilan sums', () => {
    expect(categories).toEqual(EXPECTED_CATEGORIES)
  })

  it('resolves every category and subcategory in the model', () => {
    const missing = [ROOT_DOTTED_NAME, ...categories, ...subcategories].filter(
      (name) => parsedRules[name] === undefined
    )

    expect(missing).toEqual([])
  })

  it('gives every category a non-empty sum', () => {
    const emptyCategories = categories.filter((category) => {
      const sum = getSomme(parsedRules[category].rawNode)

      return !sum || sum.length === 0
    })

    expect(emptyCategories).toEqual([])
    expect(subcategories.length).toBeGreaterThan(categories.length)
  })

  it('names every subcategory under exactly one category', () => {
    const misplaced = subcategories.filter(
      (subcategory) =>
        categories.filter((category) =>
          subcategory.startsWith(`${category} . `)
        ).length !== 1
    )

    expect(new Set(subcategories).size).toBe(subcategories.length)
    expect(misplaced).toEqual([])
  })

  it('collects the subcategories of every metric variation of a category', () => {
    const missing = categories.flatMap((category) =>
      allSums(parsedRules[category].rawNode).flatMap((sum) =>
        sum
          .map(
            (partialName) =>
              utils.disambiguateReference(
                parsedRules,
                category,
                partialName
              ) as DottedName
          )
          .filter((subcategory) => !subcategories.includes(subcategory))
      )
    )

    expect(missing).toEqual([])
  })

  it('evaluates the footprint, its categories and subcategories for both metrics', () => {
    const failures: string[] = []

    for (const metric of MODEL_METRICS) {
      for (const name of [ROOT_DOTTED_NAME, ...categories, ...subcategories]) {
        try {
          engine.evaluate({
            valeur: name,
            contexte: { métrique: `'${metric}'` },
          })
        } catch {
          failures.push(`${name} (${metric})`)
        }
      }
    }

    expect(failures).toEqual([])
  }, 60_000)
})
