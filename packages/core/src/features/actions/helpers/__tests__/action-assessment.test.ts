import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { describe, expect, it } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { toActionEvaluation } from '../action-assessment.ts'

const DOTTED_NAME = 'test . action' as DottedName

describe('toActionEvaluation', () => {
  it.each([42, -3.5])(
    'reads an applicable rule valued %s as an action of that impact',
    (value) => {
      expect(
        toActionEvaluation({ applicable: true, value }, DOTTED_NAME)
      ).toEqual(success({ applicable: true, impact: value }))
    }
  )

  it.each([0, NaN, Infinity, -Infinity])(
    'reads an applicable rule valued %s as an action without impact',
    (value) => {
      expect(
        toActionEvaluation({ applicable: true, value }, DOTTED_NAME)
      ).toEqual(success({ applicable: true, impact: undefined }))
    }
  )

  it('reads a not applicable rule as a not applicable action', () => {
    expect(toActionEvaluation({ applicable: false }, DOTTED_NAME)).toEqual(
      success({ applicable: false, impact: undefined })
    )
  })

  it('reads a not defined rule as an action left unassessed', () => {
    expect(toActionEvaluation({ applicable: undefined }, DOTTED_NAME)).toEqual(
      success({ applicable: undefined, impact: undefined })
    )
  })
})
