import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export function getSubcatsOfCategory(
  category: DottedName,
  subcategories: DottedName[] | undefined
): DottedName[] {
  return (
    subcategories?.filter((subcategory) => subcategory?.startsWith(category)) ??
    []
  )
}
