'use client'

import Link from '@/components/Link'
import { DEFAULT_LIMIT_PERCENTAGE_TO_SQUASH } from '@/constants/ravijen'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getBackgroundColor } from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import { capitalizeString } from '@/utils/capitalizeString'
import { removePercentageFromString } from '@/utils/removePercentageFromString'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import Image from 'next/image'
import EnigmaticMoreChartBlock from './subcategoryChartBlock/EnigmaticMoreChartBlock'

interface Props {
  category: DottedName
  subcategory: DottedName
  maxValue: number
  index: number
  squashLimitPercentage?: number
  sumSquashedSubcategoriesPercentage?: number
  shouldAlwaysDisplayValue?: boolean
}

export default function SubcategoryChartBlock({
  subcategory,
  category,
  maxValue,
  index,
  squashLimitPercentage,
  sumSquashedSubcategoriesPercentage,
  shouldAlwaysDisplayValue,
}: Props) {
  const { t } = useClientTranslation()

  const { numericValue: categoryNumericvalue } = useRule(category)

  const subcategoryObject = useRule(subcategory)
  const { title, abbreviatedTitle, numericValue } = subcategoryObject

  const { formattedValue, unit } = formatFootprint(numericValue, { t })

  // Here we compare the value of the current category to the value of the
  // category with the highest value. We then use this ratio to calculate the
  // height of the block, with all blocks on the same scale.
  const categoryRatio = 1 - (maxValue - categoryNumericvalue) / maxValue

  const heightPercentage =
    (numericValue / categoryNumericvalue) * (100 * categoryRatio)

  // Replace only the first item squashed by the EnigmaticMoreChartBlock
  if (
    heightPercentage <
      (squashLimitPercentage ?? DEFAULT_LIMIT_PERCENTAGE_TO_SQUASH) &&
    index !== 0
  ) {
    return null
  } else if (
    heightPercentage <
      (squashLimitPercentage ?? DEFAULT_LIMIT_PERCENTAGE_TO_SQUASH) &&
    index === 0
  ) {
    return (
      <EnigmaticMoreChartBlock
        category={category}
        percentageSquashed={sumSquashedSubcategoriesPercentage ?? 0}
      />
    )
  }

  const isSmall = heightPercentage < 13

  const titleFormatted = capitalizeString(
    removePercentageFromString(abbreviatedTitle ?? title ?? '')
  )

  return (
    <Link
      title={`${titleFormatted}, ${formattedValue} ${unit}, voir la documentation`}
      href={`/documentation/${subcategory.replaceAll(' . ', '/')}`}
      className={`!text-default relative flex items-center py-2 !no-underline hover:!underline ${
        isSmall ? 'flex-row justify-center gap-1' : 'flex-col flex-wrap'
      } ${getBackgroundColor(category)}`}
      style={{
        height: `${heightPercentage}%`,
      }}>
      <Image
        style={{ filter: 'grayscale(1) ' }}
        src={`/images/model/${subcategory}.svg`}
        alt={`${titleFormatted}, ${formattedValue} ${unit}`}
        width={20}
        height={20}
        aria-hidden="true"
        className={`h-5 w-5 ${isSmall ? '' : 'mb-1'}`}
      />

      <p className={`${isSmall ? 'mb-0' : 'mb-1'} text-center text-[0.65rem]`}>
        {titleFormatted}
      </p>

      {!isSmall && !shouldAlwaysDisplayValue && (
        <p
          className={`absolute right-1 bottom-0 z-10 mb-0 pl-1 text-[0.65rem] ${getBackgroundColor(
            category
          )}`}>
          <strong>
            {formattedValue} {unit}
          </strong>
        </p>
      )}
    </Link>
  )
}
