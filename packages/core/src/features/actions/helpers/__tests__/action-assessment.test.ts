import { describe, expect, it } from 'vitest'
import { toActionEvaluation } from '../action-assessment.ts'

describe('toActionEvaluation', () => {
  it.each([42, -3.5, Infinity, -Infinity])(
    'reads an applicable rule valued %s as an action of that impact',
    (value) => {
      expect(toActionEvaluation({ applicable: true, value })).toEqual({
        applicable: true,
        impact: value,
      })
    }
  )

  it.each([0, NaN])(
    'reads an applicable rule valued %s as an action without impact',
    (value) => {
      expect(toActionEvaluation({ applicable: true, value })).toEqual({
        applicable: true,
        impact: undefined,
      })
    }
  )

  it('reads a not applicable rule as a not applicable action', () => {
    expect(toActionEvaluation({ applicable: false })).toEqual({
      applicable: false,
      impact: undefined,
    })
  })

  it('reads a not defined rule as an action left unassessed', () => {
    expect(toActionEvaluation({ applicable: undefined })).toEqual({
      applicable: undefined,
      impact: undefined,
    })
  })
})
