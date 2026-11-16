import { describe, expect, it } from 'vitest'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { getComputedResults } from '../get-computed-results.ts'

describe('getComputedResults', () => {
  it('reads the bilan, its categories and subcategories for both metrics', () => {
    const engine = createTestEngine({
      métrique: {
        avec: { carbone: null, eau: null },
        'une possibilité': ['carbone', 'eau'],
        'par défaut': "'carbone'",
      },
      bilan: { formule: { somme: ['transport'] } },
      transport: { formule: { somme: ['voiture'] } },
      'transport . voiture': { valeur: 1 },
    })

    expect(
      getComputedResults(
        engine as unknown as Parameters<typeof getComputedResults>[0]
      )
    ).toEqual({
      carbone: {
        bilan: 1,
        categories: { transport: 1 },
        subcategories: { 'transport . voiture': 1 },
      },
      eau: {
        bilan: 1,
        categories: { transport: 1 },
        subcategories: { 'transport . voiture': 1 },
      },
    })
  })
})
