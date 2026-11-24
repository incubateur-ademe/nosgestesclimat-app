import useQuestions from '@/publicodes-state/providers/formProvider/hooks/useQuestions'
import type { SafeEvaluate } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const q = (...names: string[]) => names as DottedName[]

const categories = q(
  'logement',
  'alimentation',
  'transport',
  'divers',
  'profil'
)

const everyQuestions = q(
  'logement . type',
  'logement . propriétaire',
  'logement . lieu de vie',
  'transport . voiture . km',
  'divers . numérique . internet . durée journalière',
  'profil . âge'
)

const missingVariables = Object.fromEntries(
  everyQuestions.map((question, index) => [question, index + 1])
)

const safeEvaluate = (() => ({ missingVariables })) as unknown as SafeEvaluate

const renderQuestions = (
  props: Partial<Parameters<typeof useQuestions>[0]> = {}
) =>
  renderHook(() =>
    useQuestions({
      root: q('bilan')[0],
      safeEvaluate,
      categories,
      subcategories: [],
      situation: {},
      foldedSteps: [],
      everyQuestions,
      everyMosaicChildrenWithParent: {} as Record<DottedName, DottedName[]>,
      ...props,
    })
  )

describe('useQuestions', () => {
  it('only keeps major questions', () => {
    const { result } = renderQuestions()

    expect(result.current.remainingQuestions).toEqual(
      q(
        'logement . type',
        'transport . voiture . km',
        'logement . lieu de vie',
        'profil . âge'
      )
    )
    expect(result.current.remainingQuestions).not.toContain(
      q('logement . propriétaire')[0]
    )
    expect(result.current.remainingQuestions).not.toContain(
      q('divers . numérique . internet . durée journalière')[0]
    )
  })

  it('only keeps major answered questions', () => {
    const { result } = renderQuestions({
      foldedSteps: q('logement . propriétaire', 'logement . type'),
    })

    expect(result.current.relevantAnsweredQuestions).toEqual(
      q('logement . type')
    )
  })

  it('asks the living place then the age last', () => {
    const { result } = renderQuestions()

    expect(result.current.relevantQuestions.slice(-2)).toEqual(
      q('logement . lieu de vie', 'profil . âge')
    )
  })
})
