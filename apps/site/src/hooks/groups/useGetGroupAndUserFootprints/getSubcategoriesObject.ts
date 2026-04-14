import type {
  ComputedResultsSubcategories,
  Simulation,
} from '@/publicodes-state/types'
import type { ValueObject } from '@/types/groups'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export function getSubcategoriesObject({
  simulation,
  isCurrentMember,
  groupAccumulator,
}: {
  simulation: Simulation
  isCurrentMember: boolean
  groupAccumulator: Record<DottedName, ValueObject>
}): {
  groupSubcategoriesToAdd: Record<DottedName, ValueObject>
  userSubcategoriesToAdd?: Record<DottedName, ValueObject>
} {
  const groupSubcategoriesToAdd = { ...groupAccumulator }
  const userSubcategoriesToAdd = isCurrentMember
    ? ({} as Record<DottedName, ValueObject>)
    : undefined

  const subcategories = simulation?.computedResults?.carbone?.subcategories

  if (!subcategories) {
    return {
      groupSubcategoriesToAdd,
      userSubcategoriesToAdd,
    }
  }

  Object.entries(subcategories).forEach(
    ([subCategory, subCategoryRawValue]) => {
      const subCategoryValue =
        typeof subCategoryRawValue === 'number' ? subCategoryRawValue : 0

      // Same here if the property doesn't exist in the accumulator, we add it
      // otherwise we add the value to the existing sum
      if (
        !groupSubcategoriesToAdd[
          subCategory as keyof ComputedResultsSubcategories
        ]
      ) {
        groupSubcategoriesToAdd[
          subCategory as keyof ComputedResultsSubcategories
        ] = {
          name: subCategory as DottedName,
          value: subCategoryValue,
        }
      } else {
        groupSubcategoriesToAdd[
          subCategory as keyof ComputedResultsSubcategories
        ].value += subCategoryValue
      }

      if (isCurrentMember && userSubcategoriesToAdd) {
        // Add each category footprint for the current member
        userSubcategoriesToAdd[
          subCategory as keyof ComputedResultsSubcategories
        ] = {
          name: subCategory as DottedName,
          value: subCategoryValue,
        }
      }
    }
  )

  return {
    groupSubcategoriesToAdd,
    userSubcategoriesToAdd,
  }
}
