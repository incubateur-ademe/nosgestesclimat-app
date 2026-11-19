import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { describe, expect, it } from 'vitest'

import getSortedQuestionsList from '../getSortedQuestionsList'

const categories = ['logement', 'transport'] as DottedName[]
const subcategories = [] as DottedName[]

const sort = (
  questions: DottedName[],
  missingVariables: Record<string, number>
) =>
  getSortedQuestionsList({
    questions,
    categories,
    subcategories,
    missingVariables,
  })

describe('getSortedQuestionsList', () => {
  it('keeps an answered question before the unanswered ones of its category', () => {
    const sorted = sort(
      ['logement . type', 'logement . surface', 'logement . habitants'],
      { 'logement . surface': 500, 'logement . habitants': 900 }
    )

    expect(sorted).toEqual([
      'logement . type',
      'logement . habitants',
      'logement . surface',
    ])
  })

  it('sorts the most impactful question first', () => {
    const sorted = sort(['logement . surface', 'logement . habitants'], {
      'logement . surface': 900,
      'logement . habitants': 100,
    })

    expect(sorted).toEqual(['logement . surface', 'logement . habitants'])
  })

  it('orders the categories as declared', () => {
    const sorted = sort(['transport . voiture', 'logement . surface'], {
      'transport . voiture': 900,
      'logement . surface': 100,
    })

    expect(sorted).toEqual(['logement . surface', 'transport . voiture'])
  })
})
