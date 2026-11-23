import { describe, expect, it } from 'vitest'
import type { Rule } from '../../../models/types/rule.ts'
import { toNewRuleEvaluations } from '../to-new-rule-evaluations.ts'

const SIMULATION_ID = 'simulation'

const rules: Rule[] = [
  { id: 1, name: 'footprint', metric: 'carbon' },
  { id: 2, name: 'question', metric: 'carbon' },
  { id: 3, name: 'question', metric: 'water' },
]

describe('toNewRuleEvaluations', () => {
  it('identifies each evaluation and missing variable by the stored rule of its name and metric', () => {
    expect(
      toNewRuleEvaluations(
        SIMULATION_ID,
        [
          {
            name: 'footprint',
            metric: 'carbon',
            applicable: true,
            value: 1,
            missingVariables: [{ name: 'question', weight: 2 }],
          },
          {
            name: 'question',
            metric: 'carbon',
            applicable: undefined,
            missingVariables: [],
          },
        ],
        rules
      )
    ).toEqual([
      {
        simulationId: SIMULATION_ID,
        ruleId: 1,
        applicable: true,
        value: 1,
        missingVariables: [{ ruleId: 2, weight: 2 }],
      },
      {
        simulationId: SIMULATION_ID,
        ruleId: 2,
        applicable: undefined,
        missingVariables: [],
      },
    ])
  })

  it('throws on a missing variable that was not evaluated', () => {
    expect(() =>
      toNewRuleEvaluations(
        SIMULATION_ID,
        [
          {
            name: 'question',
            metric: 'carbon',
            applicable: undefined,
            missingVariables: [{ name: 'not evaluated', weight: 1 }],
          },
        ],
        rules
      )
    ).toThrow(
      'Invariant: no evaluation found for missing variable "carbon:not evaluated"'
    )
  })

  it('throws on an evaluation without a stored rule', () => {
    expect(() =>
      toNewRuleEvaluations(
        SIMULATION_ID,
        [
          {
            name: 'footprint',
            metric: 'water',
            applicable: false,
            missingVariables: [],
          },
        ],
        rules
      )
    ).toThrow('Invariant: no rule found for evaluation "water:footprint"')
  })
})
