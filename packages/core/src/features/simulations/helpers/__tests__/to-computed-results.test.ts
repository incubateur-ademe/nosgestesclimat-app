import { describe, expect, it } from 'vitest'
import type { Applicability } from '../../../models/types/model-rule-evaluation.ts'
import type { Metric } from '../../../models/types/rule.ts'
import type { NamedRuleEvaluation } from '../../types/rule-evaluation.ts'
import { toComputedResults } from '../to-computed-results.ts'

const SIMULATION_ID = 'simulation'

/** A named evaluation of the simulation, as the joined read returns it. */
const named = (
  ruleId: number,
  name: string,
  metric: Metric,
  applicability: Applicability
): NamedRuleEvaluation => ({
  simulationId: SIMULATION_ID,
  ruleId,
  createdAt: new Date(),
  name,
  metric,
  ...applicability,
})

describe('toComputedResults', () => {
  it('maps each metric through the shared model metric mapping and takes the bilan from the bilan evaluation', () => {
    expect(
      toComputedResults([
        named(1, 'bilan', 'carbon', { applicable: true, value: 1000 }),
        named(2, 'bilan', 'water', { applicable: true, value: 500 }),
      ])
    ).toEqual({
      carbone: {
        bilan: 1000,
        categories: {
          alimentation: 0,
          transport: 0,
          logement: 0,
          divers: 0,
          'services sociétaux': 0,
        },
        subcategories: {},
      },
      eau: {
        bilan: 500,
        categories: {
          alimentation: 0,
          transport: 0,
          logement: 0,
          divers: 0,
          'services sociétaux': 0,
        },
        subcategories: {},
      },
    })
  })

  it('takes each of the five output-contract categories from its evaluation', () => {
    const results = toComputedResults([
      named(1, 'alimentation', 'carbon', { applicable: true, value: 300 }),
      named(2, 'transport', 'carbon', { applicable: true, value: 400 }),
      named(3, 'logement', 'carbon', { applicable: true, value: 200 }),
      named(4, 'divers', 'carbon', { applicable: true, value: 50 }),
      named(5, 'services sociétaux', 'carbon', {
        applicable: true,
        value: 50,
      }),
      named(6, 'transport', 'water', { applicable: true, value: 200 }),
    ])

    expect(results.carbone.categories).toEqual({
      alimentation: 300,
      transport: 400,
      logement: 200,
      divers: 50,
      'services sociétaux': 50,
    })
    expect(results.eau.categories.transport).toBe(200)
    expect(results.eau.categories.alimentation).toBe(0)
  })

  it('keys every remaining evaluation as a subcategory by its full dotted name, per metric', () => {
    const results = toComputedResults([
      named(1, 'transport . voiture', 'carbon', {
        applicable: true,
        value: 123.5,
      }),
      named(2, 'transport . avion', 'carbon', { applicable: true, value: 45 }),
      named(3, 'logement . chauffage', 'water', {
        applicable: true,
        value: 67,
      }),
    ])

    expect(results.carbone.subcategories).toEqual({
      'transport . voiture': 123.5,
      'transport . avion': 45,
    })
    expect(results.eau.subcategories).toEqual({
      'logement . chauffage': 67,
    })
  })

  it('skips boolean and string evaluations: no subcategory line for them', () => {
    const results = toComputedResults([
      named(1, 'transport . voiture', 'carbon', {
        applicable: true,
        value: true,
      }),
      named(2, 'transport . immatriculation', 'carbon', {
        applicable: true,
        value: 'AB-123-CD',
      }),
      named(3, 'transport . avion', 'carbon', { applicable: true, value: 45 }),
    ])

    expect(results.carbone.subcategories).toEqual({
      'transport . avion': 45,
    })
  })

  it('counts not applicable, not defined and absent lines as 0', () => {
    const results = toComputedResults([
      named(1, 'bilan', 'carbon', { applicable: false }),
      named(2, 'transport', 'carbon', { applicable: undefined }),
      named(3, 'logement . chauffage', 'carbon', { applicable: false }),
      named(4, 'divers . autre', 'carbon', { applicable: undefined }),
      // No bilan, category nor subcategory evaluation at all for water.
    ])

    expect(results.carbone.bilan).toBe(0)
    expect(results.carbone.categories.transport).toBe(0)
    expect(results.carbone.categories.alimentation).toBe(0)
    expect(results.carbone.subcategories).toEqual({
      'logement . chauffage': 0,
      'divers . autre': 0,
    })
    expect(results.eau).toEqual({
      bilan: 0,
      categories: {
        alimentation: 0,
        transport: 0,
        logement: 0,
        divers: 0,
        'services sociétaux': 0,
      },
      subcategories: {},
    })
  })
})
