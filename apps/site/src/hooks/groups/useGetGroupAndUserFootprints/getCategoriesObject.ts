import type { Simulation } from '@/publicodes-state/types'
import type {
  CategoriesAndSubcategoriesFootprintsType,
  ValueObject,
} from '@/types/groups'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export function getCategoriesObject({
  simulation,
  isCurrentMember,
  groupAccumulator,
}: {
  simulation: Simulation
  isCurrentMember: boolean
  groupAccumulator: CategoriesAndSubcategoriesFootprintsType
}): {
  groupCategoriesToAdd: CategoriesAndSubcategoriesFootprintsType
  userCategoriesToAdd?: CategoriesAndSubcategoriesFootprintsType
} {
  const groupCategoriesToAdd = { ...groupAccumulator }
  const userCategoriesToAdd = isCurrentMember
    ? ({} as CategoriesAndSubcategoriesFootprintsType)
    : undefined

  const categories = simulation?.computedResults?.carbone?.categories

  if (!categories) {
    return {
      groupCategoriesToAdd,
      userCategoriesToAdd,
    }
  }

  Object.entries(categories).forEach(
    ([category, categoryRawValue]) => {
      const categoryValue =
        typeof categoryRawValue === 'number' ? categoryRawValue : 0

      const defaultCategoryObject: ValueObject = {
        name: category as DottedName,
        value: categoryValue,
        isCategory: true,
      }

      // If the category is not in the accumulator, we add its name
      // as a new key in the object along with its value otherwise we
      // add the value to the existing sum
      if (
        !groupCategoriesToAdd[
          category as keyof CategoriesAndSubcategoriesFootprintsType
        ]
      ) {
        groupCategoriesToAdd[
          category as keyof CategoriesAndSubcategoriesFootprintsType
        ] = defaultCategoryObject
      } else {
        groupCategoriesToAdd[
          category as keyof CategoriesAndSubcategoriesFootprintsType
        ].value += categoryValue
      }

      // Add each category footprint for the current member
      if (isCurrentMember && userCategoriesToAdd) {
        userCategoriesToAdd[
          category as keyof CategoriesAndSubcategoriesFootprintsType
        ] = defaultCategoryObject
      }
    },
    {
      groupCategoriesAndSubcategoriesFootprints: {},
      userCategoriesAndSubcategoriesFootprints: {},
    } as {
      groupCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
      userCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
    }
  )

  return {
    groupCategoriesToAdd,
    userCategoriesToAdd,
  }
}
