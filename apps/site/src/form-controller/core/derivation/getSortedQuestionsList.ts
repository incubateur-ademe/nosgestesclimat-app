import { getSubcatsOfCategory } from '@/helpers/publicodes/getSubcatsOfCategory'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  questions: DottedName[]
  categories: string[]
  subcategories: string[]
  missingVariables: Partial<Record<DottedName, number>>
}

export default function getSortedQuestionsList({
  questions,
  categories,
  subcategories,
  missingVariables,
}: Props): DottedName[] {
  return [...questions].sort((a, b) => {
    const [aCategory, aSubcategory] = a.split(' . ')
    const [bCategory, bSubcategory] = b.split(' . ')

    const byCategory =
      categories.indexOf(aCategory) - categories.indexOf(bCategory)
    if (byCategory !== 0) {
      return byCategory
    }

    const siblingsOfCategory = getSubcatsOfCategory(
      aCategory as DottedName,
      subcategories as DottedName[]
    )
    const bySubcategory =
      siblingsOfCategory.indexOf(
        `${aCategory} . ${aSubcategory}` as DottedName
      ) -
      siblingsOfCategory.indexOf(`${bCategory} . ${bSubcategory}` as DottedName)
    if (bySubcategory !== 0) {
      return bySubcategory
    }

    // Same category and subcategory: the most impactful question first. The
    // answered questions come first in the input, and a folded one has no score:
    // it keeps that place instead of sinking behind the unanswered ones.
    const scoreA = missingVariables[a]
    const scoreB = missingVariables[b]
    if (scoreA === undefined || scoreB === undefined) {
      return 0
    }
    return scoreB - scoreA
  })
}
