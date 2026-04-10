import type {
  CategoriesAndSubcategoriesFootprintsType,
  Participant,
} from '@/types/groups'
import { getCategoriesObject } from './useGetGroupAndUserFootprints/getCategoriesObject'
import { getSubcategoriesObject } from './useGetGroupAndUserFootprints/getSubcategoriesObject'

interface Props {
  groupMembers: Participant[]
  userId: string | null
}

export const useGetGroupAndUserFootprints = ({
  groupMembers,
  userId,
}: Props): {
  currentUserCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
  groupCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
} => {
  // Go through all group members and calculate the footprints for the group (sum of all members) and the current user
  return groupMembers.reduce<{
    currentUserCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
    groupCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
  }>(
    (acc, groupMember: Participant) => {
      const {
        currentUserCategoriesAndSubcategoriesFootprints,
        groupCategoriesAndSubcategoriesFootprints,
      } = acc

      const isCurrentMember = groupMember.userId === userId

      // Create a copy of the accumulators
      const accGroupCategoriesAndSubcategoriesFootprints = {
        ...groupCategoriesAndSubcategoriesFootprints,
      }

      const accCurrentUserCategoriesAndSubcategoriesFootprints = {
        ...currentUserCategoriesAndSubcategoriesFootprints,
      }

      // We create an object containing the sum of the categories and subcategories
      // values for the group and the values for the current user
      const { groupCategoriesToAdd, userCategoriesToAdd } = getCategoriesObject(
        {
          simulation: groupMember.simulation,
          isCurrentMember,
          // This allows use to add the current group member's footprints to
          // the group's already summed footprints
          groupAccumulator: accGroupCategoriesAndSubcategoriesFootprints,
        }
      )

      const { groupSubcategoriesToAdd, userSubcategoriesToAdd } =
        getSubcategoriesObject({
          simulation: groupMember.simulation,
          isCurrentMember,
          // This allows use to add the current group member's footprints to
          // the group's already summed footprints
          groupAccumulator: accGroupCategoriesAndSubcategoriesFootprints,
        })

      return {
        currentUserCategoriesAndSubcategoriesFootprints: {
          ...accCurrentUserCategoriesAndSubcategoriesFootprints,
          // We add the user's categories and subcategories if the current member is the user
          ...(userCategoriesToAdd || {}),
          ...(userSubcategoriesToAdd || {}),
        },
        groupCategoriesAndSubcategoriesFootprints: {
          ...accGroupCategoriesAndSubcategoriesFootprints,
          ...groupCategoriesToAdd,
          ...groupSubcategoriesToAdd,
        },
      }
    },
    {
      currentUserCategoriesAndSubcategoriesFootprints:
        {} as CategoriesAndSubcategoriesFootprintsType,
      groupCategoriesAndSubcategoriesFootprints:
        {} as CategoriesAndSubcategoriesFootprintsType,
    }
  )
}
