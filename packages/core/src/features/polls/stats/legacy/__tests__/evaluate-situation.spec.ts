import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'

import { describe, expect, test } from 'vitest'
import { getSituationDottedNameValue } from '../evaluate-situation.ts'
import type { SituationSchema } from '../situation.schema.ts'

describe('getSituationDottedNameValue', () => {
  describe('Given nested conditions', () => {
    const testCases: {
      name: string
      dottedName: DottedName
      situation: SituationSchema
      rules: Partial<NGCRules>
      expected: number
    }[] = [
      {
        name: 'evaluates nested une de ces conditions inside toutes ces conditions',
        dottedName: 'test . nested conditions' as DottedName,
        situation: {
          'alimentation . de saison . consommation': "'souvent'",
          'alimentation . local . consommation': "'souvent'",
        },
        rules: {
          'test . nested conditions': {
            formule: {
              'toutes ces conditions': [
                {
                  'une de ces conditions': [
                    "alimentation . de saison . consommation = 'souvent'",
                    "alimentation . de saison . consommation = 'oui toujours'",
                  ],
                },
                {
                  'une de ces conditions': [
                    "alimentation . local . consommation = 'souvent'",
                    "alimentation . local . consommation = 'oui parfois'",
                  ],
                },
              ],
            },
          },
        } as unknown as Partial<NGCRules>,
        expected: 1,
      },
      {
        name: 'evaluates false when a nested condition is not met',
        dottedName: 'test . nested conditions' as DottedName,
        situation: {
          'alimentation . de saison . consommation': "'souvent'",
          'alimentation . local . consommation': "'jamais'",
        },
        rules: {
          'test . nested conditions': {
            formule: {
              'toutes ces conditions': [
                {
                  'une de ces conditions': [
                    "alimentation . de saison . consommation = 'souvent'",
                    "alimentation . de saison . consommation = 'oui toujours'",
                  ],
                },
                {
                  'une de ces conditions': [
                    "alimentation . local . consommation = 'souvent'",
                    "alimentation . local . consommation = 'oui parfois'",
                  ],
                },
              ],
            },
          },
        } as unknown as Partial<NGCRules>,
        expected: 0,
      },
    ]

    test.each(testCases)(
      '$name',
      ({ dottedName, situation, rules, expected }) => {
        const algoValue = getSituationDottedNameValue({
          dottedName,
          situation,
          rules,
        })

        expect(algoValue).toBe(expected)
      }
    )
  })
})
