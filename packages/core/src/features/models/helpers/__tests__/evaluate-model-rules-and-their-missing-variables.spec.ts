import type { RawPublicodes } from 'publicodes'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createTestEngine,
  METRIC_RULE,
} from '../../../simulation-computation/factories/engine.factory.ts'
import { RuleEvaluationThrewError } from '../../errors.ts'
import type { Metric, Rule } from '../../types/rule.ts'
import { evaluateModelRulesAndTheirMissingVariables } from '../evaluate-model-rules-and-their-missing-variables.ts'

/** An engine with the given rules, next to the metric they are evaluated for. */
const engineWith = (rules: RawPublicodes<string>) =>
  createTestEngine({ ...METRIC_RULE, ...rules })

let nextRuleId = 0

/** A rule to evaluate, identified by name and metric like a stored one. */
const rule = (name: string, metric: Metric = 'carbon'): Rule => ({
  id: ++nextRuleId,
  name,
  metric,
})

describe('evaluateModelRulesAndTheirMissingVariables', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns no evaluation and no error for no rules', () => {
    expect(
      evaluateModelRulesAndTheirMissingVariables({
        engine: engineWith({}),
        rules: [],
      })
    ).toEqual({ evaluations: [], errors: [] })
  })

  it('evaluates the given rules, then their missing variables', () => {
    const engine = engineWith({
      'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
      'transport . km': { question: 'Combien de km ?', unité: 'km' },
    })

    expect(
      evaluateModelRulesAndTheirMissingVariables({
        engine,
        rules: [rule('footprint . total')],
      })
    ).toEqual({
      evaluations: [
        {
          name: 'footprint . total',
          metric: 'carbon',
          applicable: undefined,
          missingVariables: [{ name: 'transport . km', weight: 1 }],
        },
        {
          name: 'transport . km',
          metric: 'carbon',
          applicable: undefined,
          // The engine reports the question itself; the domain layer leaves it out.
          missingVariables: [],
        },
      ],
      errors: [],
    })
  })

  // A `par défaut` rule is reported as missing and its default's own missing
  // variables propagate: the missing variable's evaluation reports them too.
  it('reports the missing variables of a missing variable on its evaluation, each still evaluated once', () => {
    const engine = engineWith({
      'footprint . total': { public: 'oui', valeur: 'm . var * 2' },
      'm . var': { question: 'M ?', 'par défaut': 'n . var + 1' },
      'n . var': { question: 'N ?' },
    })

    expect(
      evaluateModelRulesAndTheirMissingVariables({
        engine,
        rules: [rule('footprint . total')],
      })
    ).toEqual({
      evaluations: [
        {
          name: 'footprint . total',
          metric: 'carbon',
          applicable: undefined,
          missingVariables: [
            { name: 'n . var', weight: 1 },
            { name: 'm . var', weight: 2 },
          ],
        },
        {
          name: 'n . var',
          metric: 'carbon',
          applicable: undefined,
          missingVariables: [],
        },
        {
          name: 'm . var',
          metric: 'carbon',
          applicable: undefined,
          missingVariables: [{ name: 'n . var', weight: 1 }],
        },
      ],
      errors: [],
    })
  })

  it('evaluates a missing variable reported by several evaluations once', () => {
    const engine = engineWith({
      'footprint . double': { public: 'oui', valeur: 'transport . km * 2' },
      'footprint . half': { public: 'oui', valeur: 'transport . km / 2' },
      'transport . km': { question: 'Combien de km ?', unité: 'km' },
    })

    const { evaluations, errors } = evaluateModelRulesAndTheirMissingVariables({
      engine,
      rules: [rule('footprint . double'), rule('footprint . half')],
    })

    expect(errors).toEqual([])
    expect(evaluations).toEqual([
      {
        name: 'footprint . double',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [{ name: 'transport . km', weight: 1 }],
      },
      {
        name: 'footprint . half',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [{ name: 'transport . km', weight: 1 }],
      },
      {
        name: 'transport . km',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [],
      },
    ])
  })

  it('does not evaluate again a missing variable that is among the given rules', () => {
    const engine = engineWith({
      'footprint . total': { public: 'oui', valeur: 'transport . km * 2' },
      'transport . km': { question: 'Combien de km ?', unité: 'km' },
    })

    const { evaluations, errors } = evaluateModelRulesAndTheirMissingVariables({
      engine,
      rules: [rule('footprint . total'), rule('transport . km')],
    })

    expect(errors).toEqual([])
    expect(evaluations).toEqual([
      {
        name: 'footprint . total',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [{ name: 'transport . km', weight: 1 }],
      },
      {
        name: 'transport . km',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [],
      },
    ])
  })

  it('evaluates each missing variable under the metric of the evaluation that reported it, once per metric', () => {
    const engine = engineWith({
      'footprint . dependent': {
        public: 'oui',
        valeur: {
          variations: [
            { si: "métrique = 'eau'", alors: 'water . question' },
            { sinon: 'carbon . question' },
          ],
        },
      },
      'carbon . question': { question: 'Carbone ?' },
      'water . question': { question: 'Eau ?' },
    })

    const { evaluations, errors } = evaluateModelRulesAndTheirMissingVariables({
      engine,
      rules: [
        rule('footprint . dependent', 'carbon'),
        rule('footprint . dependent', 'water'),
      ],
    })

    expect(errors).toEqual([])
    expect(evaluations).toEqual([
      {
        name: 'footprint . dependent',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [{ name: 'carbon . question', weight: 1 }],
      },
      {
        name: 'footprint . dependent',
        metric: 'water',
        applicable: undefined,
        missingVariables: [{ name: 'water . question', weight: 1 }],
      },
      {
        name: 'carbon . question',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [],
      },
      {
        name: 'water . question',
        metric: 'water',
        applicable: undefined,
        missingVariables: [],
      },
    ])
  })

  it('collects each error without stopping the other evaluations', () => {
    const engine = engineWith({
      'footprint . ok': { public: 'oui', valeur: 1 },
      'footprint . division': { public: 'oui', valeur: '1 / 0' },
    })

    const { evaluations, errors } = evaluateModelRulesAndTheirMissingVariables({
      engine,
      rules: [rule('footprint . ok'), rule('footprint . division')],
    })

    expect(evaluations).toEqual([
      {
        name: 'footprint . ok',
        metric: 'carbon',
        applicable: true,
        value: 1,
        missingVariables: [],
      },
    ])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toBeInstanceOf(RuleEvaluationThrewError)
    expect(errors[0]).toMatchObject({
      code: 'rule_evaluation_threw',
      dottedName: 'footprint . division',
      metric: 'carbon',
    })
    expect(errors[0]?.cause).toBeInstanceOf(Error)
  })

  // The missing variables of a failed rule are not known: they are never
  // evaluated.
  it('does not evaluate the missing variables of a failed rule', () => {
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

    const { evaluations, errors } = evaluateModelRulesAndTheirMissingVariables({
      engine,
      rules: [rule('footprint . ok'), rule('footprint . throwing')],
    })

    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatchObject({
      code: 'rule_evaluation_threw',
      dottedName: 'footprint . throwing',
    })
    // `ghost . variable` is evaluated once, reported by `footprint . ok` only.
    expect(evaluations).toEqual([
      {
        name: 'footprint . ok',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [{ name: 'ghost . variable', weight: 1 }],
      },
      {
        name: 'ghost . variable',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [],
      },
    ])
  })
})
