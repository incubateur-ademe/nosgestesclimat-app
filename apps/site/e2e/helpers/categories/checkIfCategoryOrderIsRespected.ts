import { CATEGORIES } from '../../constants/categories'
import getNamespace from '../../utils/getNamespace'

const categoriesOrderArray = CATEGORIES.map((category) => ({
  key: category,
  hasBeenDisplayed: false,
}))

export function checkIfCategoryOrderIsRespected(questionId: string): void {
  const indexCurrentCategory = categoriesOrderArray.findIndex(
    (category) => category.key === getNamespace(questionId)
  )

  if (
    indexCurrentCategory !== 0 &&
    !categoriesOrderArray[indexCurrentCategory - 1]?.hasBeenDisplayed
  ) {
    throw new Error('The category order is not respected.')
  }

  if (!categoriesOrderArray[indexCurrentCategory]?.hasBeenDisplayed) {
    categoriesOrderArray[indexCurrentCategory].hasBeenDisplayed = true
  }
}
