import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import {
  ComputedResultSchema,
  hasValidComputedResults,
} from '../computed-results.schema.ts'

const validComputedResults = {
  carbone: {
    bilan: 1000,
    categories: {
      alimentation: 300,
      transport: 400,
      logement: 200,
      divers: 50,
      'services sociétaux': 50,
    },
    subcategories: {
      'alimentation . viande': 200,
      'alimentation . végétal': 100,
    },
  },
  eau: {
    bilan: 500,
    categories: {
      alimentation: 150,
      transport: 200,
      logement: 100,
      divers: 25,
      'services sociétaux': 25,
    },
    subcategories: {},
  },
}

describe('ComputedResultSchema', () => {
  it('accepts a current-format computedResults (carbone/eau)', () => {
    expect(
      v.safeParse(ComputedResultSchema, validComputedResults).success
    ).toBe(true)
  })

  it('rejects a legacy computedResults without the carbone/eau shape', () => {
    expect(
      v.safeParse(ComputedResultSchema, {
        bilan: 1000,
        categories: { transport: 1000 },
      }).success
    ).toBe(false)
  })

  it('rejects a computedResults missing the eau metric', () => {
    expect(
      v.safeParse(ComputedResultSchema, {
        ...validComputedResults,
        eau: undefined,
      }).success
    ).toBe(false)
  })
})

describe('hasValidComputedResults', () => {
  it('returns true for a simulation with a current-format computedResults', () => {
    expect(
      hasValidComputedResults({ computedResults: validComputedResults })
    ).toBe(true)
  })

  it('returns false for a simulation with a legacy computedResults', () => {
    expect(
      hasValidComputedResults({
        computedResults: {
          bilan: 1000,
          categories: { transport: 1000 },
        },
      })
    ).toBe(false)
  })

  it('returns false when computedResults is missing', () => {
    expect(hasValidComputedResults({})).toBe(false)
  })
})
