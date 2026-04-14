import { getSubcatsOfCategory } from '@/helpers/publicodes/getSubcatsOfCategory'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  questions: DottedName[]
  categories: string[]
  subcategories: string[]
  missingVariables: Record<string, number>
}

export default function getSortedQuestionsList({
  questions,
  categories,
  subcategories,
  missingVariables,
}: Props): DottedName[] {
  return questions.sort((a, b) => {
    const aSplittedName = a.split(' . ')
    const bSplittedName = b.split(' . ')

    // We first sort by category
    if (
      categories.indexOf(aSplittedName[0]) >
      categories.indexOf(bSplittedName[0])
    ) {
      return 1
    }
    if (
      categories.indexOf(aSplittedName[0]) <
      categories.indexOf(bSplittedName[0])
    ) {
      return -1
    }

    // then by subcategory
    const categoryOfBothQuestions = aSplittedName[0]
    const aCategoryAndSubcategory = aSplittedName[0] + ' . ' + aSplittedName[1]
    const bCategoryAndSubcategory = bSplittedName[0] + ' . ' + bSplittedName[1]

    const subcategoriesOfBothQuestions = getSubcatsOfCategory(
      categoryOfBothQuestions as DottedName,
      subcategories as DottedName[]
    )

    if (
      subcategoriesOfBothQuestions.indexOf(
        aCategoryAndSubcategory as DottedName
      ) >
      subcategoriesOfBothQuestions.indexOf(
        bCategoryAndSubcategory as DottedName
      )
    ) {
      return 1
    }
    if (
      subcategoriesOfBothQuestions.indexOf(
        aCategoryAndSubcategory as DottedName
      ) <
      subcategoriesOfBothQuestions.indexOf(
        bCategoryAndSubcategory as DottedName
      )
    ) {
      return -1
    }

    // We should reach this point only for questions at the root level of a category.
    return missingVariables[b] - missingVariables[a]
  })
}
