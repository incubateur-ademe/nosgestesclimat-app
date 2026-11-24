import { faker } from '@faker-js/faker'
import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createTestEngine,
  METRIC_RULE,
} from '../../../simulation-computation/factories/engine.factory.ts'
import {
  RuleEvaluationThrewError,
  UnexpectedNodeValueError,
} from '../../errors.ts'
import { evaluateModelRule as evaluateModelRuleBase } from '../evaluate-model-rule.ts'

/** An engine with the given rules, next to the metric they are evaluated for. */
const engineWith = (rules: RawPublicodes<string>) =>
  createTestEngine({ ...METRIC_RULE, ...rules })

const base = {
  simulationId: faker.string.uuid(),
  createdAt: new Date('2026-11-23T00:00:00.000Z'),
}

/** `evaluateModelRule` bound to a fixed simulation, so expectations can name its binding. */
const evaluate = (
  args: Omit<Parameters<typeof evaluateModelRuleBase>[0], keyof typeof base>
) => evaluateModelRuleBase({ ...args, ...base })

/**
 * An engine whose evaluations all come back with `nodeValue`: no publicodes
 * formula evaluates to a non-finite number or to an object.
 */
const engineWithNodeValue = (nodeValue: unknown): Engine => {
  const engine = engineWith({
    'footprint . rule': { public: 'oui', valeur: 1 },
  })
  const evaluate = engine.evaluate.bind(engine)
  vi.spyOn(engine, 'evaluate').mockImplementation(
    (expression) =>
      ({ ...evaluate(expression), nodeValue }) as ReturnType<Engine['evaluate']>
  )
  return engine
}

describe('evaluateModelRule', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('evaluates a numeric value as applicable, 0 included', () => {
    const engine = engineWith({
      'footprint . zero': { public: 'oui', valeur: 0 },
      'footprint . number': { public: 'oui', valeur: 12.5 },
    })

    expect(
      evaluate({
        engine,
        dottedName: 'footprint . zero',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . zero',
        metric: 'carbon',
        missingVariables: [],
        applicable: true,
        value: 0,
      },
    })
    expect(
      evaluate({
        engine,
        dottedName: 'footprint . number',
        metric: 'water',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . number',
        metric: 'water',
        missingVariables: [],
        applicable: true,
        value: 12.5,
      },
    })
  })

  it('evaluates a boolean value as applicable, false included', () => {
    const engine = engineWith({
      'footprint . yes': { public: 'oui', valeur: 'oui' },
      'footprint . no': { public: 'oui', valeur: 'non' },
    })

    expect(
      evaluate({
        engine,
        dottedName: 'footprint . yes',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . yes',
        metric: 'carbon',
        missingVariables: [],
        applicable: true,
        value: true,
      },
    })
    expect(
      evaluate({
        engine,
        dottedName: 'footprint . no',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . no',
        metric: 'carbon',
        missingVariables: [],
        applicable: true,
        value: false,
      },
    })
  })

  it('evaluates a string value as applicable, the empty string included', () => {
    const engine = engineWith({
      'footprint . text': { public: 'oui', valeur: "'texte'" },
      'footprint . empty': { public: 'oui', valeur: "''" },
    })

    expect(
      evaluate({
        engine,
        dottedName: 'footprint . text',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . text',
        metric: 'carbon',
        missingVariables: [],
        applicable: true,
        value: 'texte',
      },
    })
    expect(
      evaluate({
        engine,
        dottedName: 'footprint . empty',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . empty',
        metric: 'carbon',
        missingVariables: [],
        applicable: true,
        value: '',
      },
    })
  })

  it('evaluates a null value as not applicable, whatever the rule type', () => {
    const engine = engineWith({
      'footprint . non applicable': {
        public: 'oui',
        'non applicable si': 'oui',
        valeur: 3,
      },
      'footprint . applicable si non': {
        public: 'oui',
        'applicable si': 'non',
        valeur: "'texte'",
      },
    })

    for (const dottedName of [
      'footprint . non applicable',
      'footprint . applicable si non',
    ]) {
      expect(evaluate({ engine, dottedName, metric: 'carbon' })).toEqual({
        success: true,
        data: {
          ...base,
          name: dottedName,
          metric: 'carbon',
          missingVariables: [],
          applicable: false,
        },
      })
    }
  })

  it('evaluates an undefined value as not defined, an unanswered question or a rule without formula', () => {
    const engine = engineWith({
      'footprint . unanswered': {
        public: 'oui',
        question: 'Combien ?',
        unité: 'kgCO2e',
      },
      'footprint . no formula': { public: 'oui' },
    })

    for (const dottedName of [
      'footprint . unanswered',
      'footprint . no formula',
    ]) {
      expect(evaluate({ engine, dottedName, metric: 'water' })).toEqual({
        success: true,
        data: {
          ...base,
          name: dottedName,
          metric: 'water',
          missingVariables: [],
          applicable: undefined,
        },
      })
    }
  })

  it('evaluates the rule in the context of the given metric', () => {
    const engine = engineWith({
      'footprint . dependent': {
        public: 'oui',
        valeur: {
          variations: [{ si: "métrique = 'eau'", alors: 5 }, { sinon: 10 }],
        },
      },
    })

    expect(
      evaluate({
        engine,
        dottedName: 'footprint . dependent',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . dependent',
        metric: 'carbon',
        missingVariables: [],
        applicable: true,
        value: 10,
      },
    })
    expect(
      evaluate({
        engine,
        dottedName: 'footprint . dependent',
        metric: 'water',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . dependent',
        metric: 'water',
        missingVariables: [],
        applicable: true,
        value: 5,
      },
    })
  })

  it('reports the missing variables with their weights', () => {
    const engine = engineWith({
      'footprint . total': {
        public: 'oui',
        valeur: 'transport . km * 2 + transport . km',
      },
      'transport . km': { question: 'Combien de km ?', unité: 'km' },
    })

    expect(
      evaluate({
        engine,
        dottedName: 'footprint . total',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . total',
        metric: 'carbon',
        applicable: undefined,
        missingVariables: [{ name: 'transport . km', weight: 2 }],
      },
    })
  })

  it('never reports the rule as its own missing variable, a `par défaut` included', () => {
    const engine = engineWith({
      'footprint . default': { public: 'oui', 'par défaut': 5 },
    })

    expect(
      evaluate({
        engine,
        dottedName: 'footprint . default',
        metric: 'carbon',
      })
    ).toEqual({
      success: true,
      data: {
        ...base,
        name: 'footprint . default',
        metric: 'carbon',
        missingVariables: [],
        applicable: true,
        value: 5,
      },
    })
  })

  describe('fails', () => {
    it('when the engine throws, a rule missing from the model or an impossible formula', () => {
      const engine = engineWith({
        'footprint . division': { public: 'oui', valeur: '1 / 0' },
      })

      for (const dottedName of [
        'footprint . missing',
        'footprint . division',
      ]) {
        const result = evaluate({
          engine,
          dottedName,
          metric: 'water',
        })
        if (result.success) {
          throw new Error(`Expected ${dottedName} to fail`)
        }
        expect(result.error).toBeInstanceOf(RuleEvaluationThrewError)
        expect(result.error).toMatchObject({
          code: 'rule_evaluation_threw',
          dottedName,
          metric: 'water',
        })
        expect(result.error.cause).toBeInstanceOf(Error)
      }
    })

    // Named by its value: its type, a number, says nothing.
    it('when the node value is a non-finite number, named by its value', () => {
      for (const [label, nodeValue] of [
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
      ] as const) {
        const result = evaluate({
          engine: engineWithNodeValue(nodeValue),
          dottedName: 'footprint . rule',
          metric: 'carbon',
        })
        if (result.success) {
          throw new Error(`Expected ${label} to fail`)
        }
        expect(result.error).toBeInstanceOf(UnexpectedNodeValueError)
        expect(result.error).toMatchObject({
          code: 'unexpected_node_value',
          dottedName: 'footprint . rule',
          metric: 'carbon',
          nodeValue: label,
        })
      }
    })

    it('when the node value has an unexpected type, named by its type', () => {
      const result = evaluate({
        engine: engineWithNodeValue({ formule: 'impossible' }),
        dottedName: 'footprint . rule',
        metric: 'carbon',
      })
      if (result.success) {
        throw new Error('Expected an object node value to fail')
      }
      expect(result.error).toBeInstanceOf(UnexpectedNodeValueError)
      expect(result.error).toMatchObject({
        code: 'unexpected_node_value',
        dottedName: 'footprint . rule',
        metric: 'carbon',
        nodeValue: 'object',
      })
    })
  })
})
