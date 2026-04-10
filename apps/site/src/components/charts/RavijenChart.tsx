'use client'

import Trans from '@/components/translation/trans/TransClient'
import { trackingDownloadRavijenChart } from '@/constants/tracking/misc'
import Button from '@/design-system/buttons/Button'
import { getSubcatsOfCategory } from '@/helpers/publicodes/getSubcatsOfCategory'
import { useEngine } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { toPng } from 'html-to-image'
import CategoryChart from './ravijenChart/CategoryChart'

interface Props {
  categories: DottedName[]
  subcategories?: DottedName[] | undefined
  squashLimitPercentage?: number
  isInverted?: boolean
  shouldAlwaysDisplayValue?: boolean
}

export default function RavijenChart({
  categories,
  subcategories,
  squashLimitPercentage,
  isInverted = false,
  shouldAlwaysDisplayValue,
}: Props) {
  const { getNumericValue } = useEngine()

  const worstFootprintCategoryValue = categories
    ?.map((category) => getNumericValue(category) ?? 0)
    ?.sort((a, b) => b - a)[0]

  if (!categories) return null

  return (
    <div className="mb-8">
      <ul
        id="ravijen"
        className="flex h-[40rem] max-w-full scale-75 items-end gap-1 bg-white py-4 md:w-[36rem] md:scale-100 md:px-4">
        {categories.map((category) => (
          <li key={category} className="h-full flex-1">
            <CategoryChart
              category={category}
              subcategories={getSubcatsOfCategory(category, subcategories)}
              maxValue={worstFootprintCategoryValue}
              squashLimitPercentage={squashLimitPercentage}
              isInverted={isInverted}
              shouldAlwaysDisplayValue={shouldAlwaysDisplayValue}
            />
          </li>
        ))}
      </ul>
      <div className="md:px-4">
        <Button
          size="sm"
          color="secondary"
          onClick={() => {
            trackMatomoEvent__deprecated(trackingDownloadRavijenChart)

            const ravijen = document.getElementById('ravijen')!

            toPng(ravijen).then(function (dataUrl) {
              const link = document.createElement('a')
              link.download = 'empreinte_carbone_ravijen_nosgestesclimat.png'
              link.href = dataUrl
              link.click()
              link.remove()
            })
          }}>
          <Trans>Télécharger l'image</Trans>
        </Button>
      </div>
    </div>
  )
}
