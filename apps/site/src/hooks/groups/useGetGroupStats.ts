import { getUserCategoryFootprintsSortedByDifference } from '@/helpers/groups/getUserCategoryFootprintsSortedByDifference'
import type {
  CategoriesAndSubcategoriesFootprintsType,
  Participant,
  PointsFortsFaiblesType,
} from '@/types/groups'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useGetGroupAndUserFootprints } from './useGetGroupAndUserFootprints'

interface Props {
  groupMembers: Participant[]
  userId: string
}

interface ResultsType {
  currentUserCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
  groupCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
  pointsForts: PointsFortsFaiblesType[]
  pointsFaibles: PointsFortsFaiblesType[]
}

export const useGetGroupStats = ({ groupMembers, userId }: Props) => {
  const {
    groupCategoriesAndSubcategoriesFootprints,
    currentUserCategoriesAndSubcategoriesFootprints,
  } = useGetGroupAndUserFootprints({
    groupMembers,
    userId,
  })

  const results: ResultsType = {
    currentUserCategoriesAndSubcategoriesFootprints: {
      ...currentUserCategoriesAndSubcategoriesFootprints,
    },
    groupCategoriesAndSubcategoriesFootprints: {
      ...groupCategoriesAndSubcategoriesFootprints,
    },
    pointsForts: [],
    pointsFaibles: [],
  }

  // Calculate the mean for the group for each category
  Object.keys(results.groupCategoriesAndSubcategoriesFootprints).forEach(
    (key) => {
      const typedKey = key as DottedName

      // Calculate mean for the group for each category
      results.groupCategoriesAndSubcategoriesFootprints[typedKey].mean =
        results.groupCategoriesAndSubcategoriesFootprints[typedKey].value /
        groupMembers.length
    }
  )

  // Calculate the current user variation between its value and the group mean for each category
  // and subcategory
  Object.keys(results.currentUserCategoriesAndSubcategoriesFootprints).forEach(
    (key) => {
      const typedKey = key as DottedName

      results.currentUserCategoriesAndSubcategoriesFootprints[
        typedKey
      ].difference = getDifference({
        value:
          results.currentUserCategoriesAndSubcategoriesFootprints[typedKey]
            .value,
        mean:
          results.groupCategoriesAndSubcategoriesFootprints[typedKey]?.mean ??
          0,
      })
    }
  )

  const {
    positiveDifferenceCategoriesSorted,
    negativeDifferenceCategoriesSorted,
  } = getUserCategoryFootprintsSortedByDifference({
    currentUserCategoriesAndSubcategoriesFootprints:
      results.currentUserCategoriesAndSubcategoriesFootprints,
  })

  results.pointsForts = positiveDifferenceCategoriesSorted.slice(0, 2)
  results.pointsFaibles = negativeDifferenceCategoriesSorted.slice(0, 3)

  return results
}

const getDifference = ({ value, mean }: { value: number; mean: number }) => {
  return value - mean
}
