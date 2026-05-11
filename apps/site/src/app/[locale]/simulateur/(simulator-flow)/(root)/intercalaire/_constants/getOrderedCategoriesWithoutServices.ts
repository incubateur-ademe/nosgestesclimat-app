import { orderedCategories } from '@/constants/model/orderedCategories'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const orderedCategoriesWithoutServices: DottedName[] =
  orderedCategories.filter((c) => c !== 'services sociétaux')
