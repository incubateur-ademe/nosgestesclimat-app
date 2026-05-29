import type { ComputedResult } from '../types/computed-result.ts'

// @TODO This is sad, but it's how its done on server right now. We'll need to refactor that asap.
export const getEmptyComputedResults = (): ComputedResult => ({
  carbone: {
    bilan: 0,
    categories: {
      'services sociétaux': 0,
      alimentation: 0,
      divers: 0,
      logement: 0,
      transport: 0,
    },
    subcategories: {},
  },
  eau: {
    bilan: 0,
    categories: {
      'services sociétaux': 0,
      alimentation: 0,
      divers: 0,
      logement: 0,
      transport: 0,
    },
    subcategories: {},
  },
})
