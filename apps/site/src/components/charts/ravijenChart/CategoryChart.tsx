'use client'

import { DEFAULT_LIMIT_PERCENTAGE_TO_SQUASH } from '@/constants/ravijen'
import { useEngine } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import SubcategoryChartBlock from './categoryChart/SubcategoryChartBlock'
import TotalCategoryBlock from './categoryChart/TotalCategoryBlock'

interface Props {
  category: DottedName
  subcategories?: DottedName[] | undefined
  maxValue: number
  squashLimitPercentage?: number
  isInverted?: boolean
  shouldAlwaysDisplayValue?: boolean
}

export default function CategoryChart({
  category,
  subcategories,
  maxValue,
  squashLimitPercentage,
  isInverted = false,
  shouldAlwaysDisplayValue,
}: Props) {
  const { getNumericValue, checkIfValid } = useEngine()

  const sortedSubcategories = subcategories
    ?.filter((subcategory) => checkIfValid(subcategory))
    // Get the value to display in the EnigmaticMoreChartBlock
    .map((subcategory) => {
      const categoryValue = getNumericValue(category) ?? 0

      const subcategoryValue = getNumericValue(subcategory) ?? 0

      const subcategoryPercentage = (subcategoryValue / categoryValue) * 100

      return {
        subcategory,
        subcategoryPercentage,
      }
    })
    .sort((categoryA, categoryB) => {
      const valueA = getNumericValue(categoryA.subcategory) ?? 0
      const valueB = getNumericValue(categoryB.subcategory) ?? 0

      return valueA - valueB
    })

  const sumSquashedSubcategoriesPercentage =
    sortedSubcategories?.reduce((sum, { subcategoryPercentage }) => {
      if (
        subcategoryPercentage <
        (squashLimitPercentage ?? DEFAULT_LIMIT_PERCENTAGE_TO_SQUASH)
      ) {
        return sum + subcategoryPercentage
      }
      return sum
    }, 0) ?? 0

  return (
    <div
      className={`flex h-full ${
        isInverted ? 'flex-col-reverse' : 'flex-col'
      } justify-end gap-[4px]`}>
      <div
        className={`flex h-[calc(100%-7rem)] ${
          isInverted ? 'flex-col-reverse' : 'flex-col'
        } justify-end gap-[1px]`}>
        {sortedSubcategories?.map(({ subcategory }, index: number) => {
          return (
            <SubcategoryChartBlock
              key={subcategory}
              category={category}
              subcategory={subcategory}
              maxValue={maxValue}
              index={index}
              squashLimitPercentage={squashLimitPercentage}
              sumSquashedSubcategoriesPercentage={
                sumSquashedSubcategoriesPercentage
              }
              shouldAlwaysDisplayValue={shouldAlwaysDisplayValue}
            />
          )
        })}
      </div>

      <TotalCategoryBlock category={category} />
    </div>
  )
}
