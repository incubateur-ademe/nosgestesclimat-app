import { faker } from '@faker-js/faker'
import type { RawPublicodes } from 'publicodes'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createTestEngine,
  METRIC_RULE,
} from '../../../simulation-computation/factories/engine.factory.ts'
import { RuleEvaluationThrewError } from '../../errors.ts'
import { evaluateModelRules as evaluateBase } from '../evaluate-model-rules.ts'

/** An engine with the given rules, next to the metric they are evaluated for. */
const engineWith = (rules: RawPublicodes<string>) =>
  createTestEngine({ ...METRIC_RULE, ...rules })

const base = {
  simulationId: faker.string.uuid(),
  createdAt: new Date('2026-11-23T00:00:00.000Z'),
}

/** The helper bound to a fixed simulation, so expectations can name its binding. */
const evaluateRules = (
  args: Omit<Parameters<typeof evaluateBase>[0], keyof typeof base>
) => evaluateBase({ ...args, ...base })

/** A rule to evaluate, identified by name and water mark like a stored row. */
const rule = (name: string, appliesToWaterMetric = false) => ({
  name,
  appliesToWaterMetric,
})

describe('evaluateModelRules', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns no evaluation and no error for no rules', () => {
    expect(
      evaluateRules({
        engine: engineWith({}),
        rules: [],
      })
    ).toEqual({ evaluations: [], errors: [] })
  })

  it('evaluates the given rules, reporting their missing variables without evaluating them', () => {
    const engine = engineWith({
      'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
      'transport . km': { question: 'Combien de km ?', unité: 'km' },
    })

    expect(
      evaluateRules({
        engine,
        rules: [rule('footprint . total')],
      })
    ).toEqual({
      evaluations: [
        {
          name: 'footprint . total',
          metric: null,
          applicable: undefined,
          ...base,
          missingVariables: [{ name: 'transport . km', weight: 1 }],
        },
      ],
      errors: [],
    })
  })

  it('evaluates each given rule under its own metric', () => {
    const engine = engineWith({
      'footprint . dependent': {
        public: 'oui',
        valeur: {
          variations: [{ si: "métrique = 'eau'", alors: 5 }, { sinon: 10 }],
        },
      },
    })

    expect(
      evaluateRules({
        engine,
        rules: [
          rule('footprint . dependent'),
          rule('footprint . dependent', true),
        ],
      })
    ).toEqual({
      evaluations: [
        {
          name: 'footprint . dependent',
          metric: null,
          applicable: true,
          value: 10,
          ...base,
          missingVariables: [],
        },
        {
          name: 'footprint . dependent',
          metric: 'water',
          applicable: true,
          value: 5,
          ...base,
          missingVariables: [],
        },
      ],
      errors: [],
    })
  })

  it('collects each error without stopping the other evaluations', () => {
    const engine = engineWith({
      'footprint . ok': { public: 'oui', valeur: 1 },
      'footprint . division': { public: 'oui', valeur: '1 / 0' },
    })

    const { evaluations, errors } = evaluateRules({
      engine,
      rules: [rule('footprint . ok'), rule('footprint . division')],
    })

    expect(evaluations).toEqual([
      {
        name: 'footprint . ok',
        metric: null,
        applicable: true,
        value: 1,
        ...base,
        missingVariables: [],
      },
    ])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toBeInstanceOf(RuleEvaluationThrewError)
    expect(errors[0]).toMatchObject({
      code: 'rule_evaluation_threw',
      ruleName: 'footprint . division',
      metric: null,
    })
    expect(errors[0]?.cause).toBeInstanceOf(Error)
  })

  it('reports no missing variable for a failed rule, its own are not known', () => {
    const engine = engineWith({
      'footprint . ok': { public: 'oui', valeur: 'ghost . variable + 1' },
      'footprint . throwing': { public: 'oui', valeur: 'ghost . variable' },
      'ghost . variable': { question: 'Fantôme ?' },
    })
    const evaluate = engine.evaluate.bind(engine)
    vi.spyOn(engine, 'evaluate').mockImplementation((expression) => {
      if (
        typeof expression === 'object' &&
        'valeur' in expression &&
        expression.valeur === 'footprint . throwing'
      ) {
        throw new Error('boom')
      }
      return evaluate(expression)
    })

    const { evaluations, errors } = evaluateRules({
      engine,
      rules: [rule('footprint . ok'), rule('footprint . throwing')],
    })

    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatchObject({
      code: 'rule_evaluation_threw',
      ruleName: 'footprint . throwing',
    })
    // `ghost . variable` is only reported by `footprint . ok`, never evaluated.
    expect(evaluations).toEqual([
      {
        name: 'footprint . ok',
        metric: null,
        applicable: undefined,
        ...base,
        missingVariables: [{ name: 'ghost . variable', weight: 1 }],
      },
    ])
  })
})
