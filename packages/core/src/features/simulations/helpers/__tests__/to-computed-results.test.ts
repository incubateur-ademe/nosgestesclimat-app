import { describe, expect, it } from 'vitest'
import type {
  RuleEvaluation,
  RuleEvaluationOutput,
} from '../../../models/types/rule-evaluation.ts'
import type { Metric } from '../../../models/types/rule.ts'
import { toComputedResults } from '../to-computed-results.ts'

const SIMULATION_ID = 'simulation'

/** An evaluation of the simulation, as the joined read returns it: `null` is
 * the default (carbon) metric. */
const named = (
  name: string,
  metric: Metric | null,
  output: RuleEvaluationOutput
): RuleEvaluation => ({
  simulationId: SIMULATION_ID,
  createdAt: new Date(),
  name,
  metric,
  ...output,
})

describe('toComputedResults', () => {
  it('maps each metric to its computed-results key and takes the bilan from the bilan evaluation', () => {
    expect(
      toComputedResults([
        named('bilan', null, { applicable: true, value: 1000 }),
        named('bilan', 'water', { applicable: true, value: 500 }),
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
      named('alimentation', null, { applicable: true, value: 300 }),
      named('transport', null, { applicable: true, value: 400 }),
      named('logement', null, { applicable: true, value: 200 }),
      named('divers', null, { applicable: true, value: 50 }),
      named('services sociétaux', null, {
        applicable: true,
        value: 50,
      }),
      named('transport', 'water', { applicable: true, value: 200 }),
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
      named('transport . voiture', null, {
        applicable: true,
        value: 123.5,
      }),
      named('transport . avion', null, { applicable: true, value: 45 }),
      named('logement . chauffage', 'water', {
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
      named('transport . voiture', null, {
        applicable: true,
        value: true,
      }),
      named('transport . immatriculation', null, {
        applicable: true,
        value: 'AB-123-CD',
      }),
      named('transport . avion', null, { applicable: true, value: 45 }),
    ])

    expect(results.carbone.subcategories).toEqual({
      'transport . avion': 45,
    })
  })

  it('counts not applicable, not defined and absent lines as 0', () => {
    const results = toComputedResults([
      named('bilan', null, { applicable: false }),
      named('transport', null, { applicable: undefined }),
      named('logement . chauffage', null, { applicable: false }),
      named('divers . autre', null, { applicable: undefined }),
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
