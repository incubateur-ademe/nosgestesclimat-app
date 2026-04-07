'use client'

import { FILTER_SEARCH_PARAM_KEY } from '@/constants/filtering'

import { captureTrackingCategoryFilter } from '@/constants/tracking/posthogTrackers'
import { baseClassNames } from '@/design-system/buttons/Button'
import {
  getBackgroundColor,
  getBackgroundLightColor,
  getBorderDarkColor,
  getTextDarkColor,
} from '@/helpers/getCategoryColorClass'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { encodeDottedNameAsURI } from '@/utils/format/encodeDottedNameAsURI'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

interface Props {
  title: string
  dottedName: DottedName
  count: number
  index: number
  isActive: boolean

  onTabActivate: () => void
  categorySelected?: string
}

export default function CategoryFilter({
  title,
  dottedName,
  count,
  index,
  isActive,

  onTabActivate,
  categorySelected,
}: Props) {
  const router = useRouter()
  const { t } = useClientTranslation()

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const encodedDottedName = encodeDottedNameAsURI(dottedName)

  const isSelected =
    categorySelected && encodedDottedName === categorySelected ? true : false

  const buildURL = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (encodedDottedName === categorySelected) {
      params.delete(FILTER_SEARCH_PARAM_KEY)
    } else {
      params.set(FILTER_SEARCH_PARAM_KEY, encodedDottedName)
    }

    return `${pathname}?${params.toString()}`
  }

  const handleClick = () => {
    onTabActivate()
    trackPosthogEvent(captureTrackingCategoryFilter({ category: dottedName }))

    router.replace(buildURL(), {
      scroll: false,
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      role="tab"
      id={`category-tab-${index}`}
      aria-selected={isSelected}
      aria-controls={`category-panel-${index}`}
      tabIndex={isActive ? 0 : -1}
      title={`${title} - ${isSelected ? t('Page active') : t('Sélectionner ce filtre et afficher uniquement les éléments de cette catégorie')}`}
      className={twMerge(
        'height-[1.8rem] rounded-md! border-2 border-transparent p-2 text-xs font-bold transition-colors',
        baseClassNames,
        isSelected || !categorySelected
          ? `${getBackgroundLightColor(dottedName)} ${getBorderDarkColor(dottedName)}`
          : `bg-gray-100 hover:bg-gray-200`
      )}
      style={{
        backgroundColor: isSelected ? getBackgroundColor() : undefined,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      <span className={getTextDarkColor(dottedName)}>
        {title}{' '}
        <span
          className={`ml-2 inline-block w-4 rounded-full bg-white ${getTextDarkColor(dottedName)}`}>
          {count ?? 0}
        </span>
      </span>
    </button>
  )
}
