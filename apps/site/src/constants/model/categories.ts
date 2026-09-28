import type { Categories } from '@incubateur-ademe/nosgestesclimat'

export const orderedTestCategories: Categories[] = [
  'logement',
  'alimentation',
  'transport',
  'divers',
]

export const expandedTestOrderedCategories: (Categories | 'âge')[] = [
  ...orderedTestCategories,
  'âge',
]

export const orderedCategories: Categories[] = [
  ...orderedTestCategories,
  'services sociétaux',
]
