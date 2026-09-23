import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const testOrderedCategories: DottedName[] = [
  'logement',
  'alimentation',
  'transport',
  'divers',
]

export const expendedTestOrderedCategories: DottedName[] = [
  ...testOrderedCategories,
  'âge',
]

export const orderedCategories: DottedName[] = [
  ...testOrderedCategories,
  'services sociétaux',
]
