'use client'

import Link from '@/components/Link'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import Image from 'next/image'

export default function TotalCategoryBlock({
  category,
}: {
  category: DottedName
}) {
  const { numericValue: totalNumericValue } = useRule('bilan')

  const { t } = useClientTranslation()

  const { title, numericValue } = useRule(category)

  const { formattedValue, unit } = formatFootprint(numericValue, {
    shouldUseAbbreviation: true,
    t,
  })

  const percentage = ((numericValue / totalNumericValue) * 100).toFixed(1)

  return (
    <Link
      title={`${title}, ${formattedValue} ${unit}, ${percentage}% ${t('documentation.total_category_block.title', 'du total, voir la documentation')}`}
      href={`/documentation/${category}`}
      className="flex h-[7rem] flex-col items-center justify-center bg-gray-500 py-2 text-white! no-underline! hover:underline!">
      <Image
        style={{ filter: 'grayscale(1) invert(1) brightness(1.8)' }}
        src={`/images/model/${category}.svg`}
        alt=""
        width={24}
        height={24}
        className="h-6 md:w-6"
      />

      <p className="mt-1 mb-2 text-[0.65rem]">{title}</p>

      <p className="mb-0 text-sm">
        <strong>
          {formattedValue} {unit}
        </strong>
      </p>
    </Link>
  )
}
