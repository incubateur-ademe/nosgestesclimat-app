import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const testOrderedCategories: DottedName[] = [
  'logement',
  'alimentation',
  'transport',
  'divers',
]

export const orderedCategories: DottedName[] = [
  ...testOrderedCategories,
  'services sociétaux',
]
