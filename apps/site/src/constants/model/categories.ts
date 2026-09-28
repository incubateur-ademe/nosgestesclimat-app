import type { Categories } from '@incubateur-ademe/nosgestesclimat'

export const orderedTestCategories: Categories[] = [
  'logement',
  'alimentation',
  'transport',
  'divers',
]

export const orderedTestCategoriesWithProfile: (Categories | 'profil')[] = [
  ...orderedTestCategories,
  'profil',
]

export const orderedCategories: Categories[] = [
  ...orderedTestCategories,
  'services sociétaux',
]
