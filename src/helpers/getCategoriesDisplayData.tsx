import CarIcon from '@/components/icons/CarIcon'
import FoodIcon from '@/components/icons/FoodIcon'
import HousingIcon from '@/components/icons/HousingIcon'
import MiscIcon from '@/components/icons/MiscIcon'
import PublicServicesIcon from '@/components/icons/PublicServicesIcon'
import { carboneMetric } from '@/constants/model/metric'
import { orderedCategories } from '@/constants/model/orderedCategories'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getRuleTitle } from '@/helpers/publicodes/getRuleTitle'
import type { Locale } from '@/i18nConfig'
import type { ComputedResults, Metric } from '@/publicodes-state/types'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import type { ReactNode } from 'react'

export interface SubcategoryDisplayData {
  dottedName: DottedName
  title: string
  formattedValue: string
  unit: string | null
  percentage: number
  displayPercentage: string
}

interface CategoryDisplayData extends SubcategoryDisplayData {
  icon: ReactNode
  bgBarClassName: string
  bgLightClassName: string
  bgIconClassName: string
  subcategories: SubcategoryDisplayData[]
}

const CATEGORIES_MAPPER = {
  logement: {
    icon: <HousingIcon />,
    bgBarClassName: 'bg-green-800',
    bgLightClassName: 'bg-green-50',
    bgIconClassName: 'bg-green-100',
  },
  alimentation: {
    icon: <FoodIcon />,
    bgBarClassName: 'bg-orange-800',
    bgLightClassName: 'bg-orange-50',
    bgIconClassName: 'bg-orange-100',
  },
  transport: {
    icon: <CarIcon />,
    bgBarClassName: 'bg-blue-800',
    bgLightClassName: 'bg-blue-50',
    bgIconClassName: 'bg-blue-100',
  },
  'services sociétaux': {
    icon: <PublicServicesIcon />,
    bgBarClassName: 'bg-purple-800',
    bgLightClassName: 'bg-purple-50',
    bgIconClassName: 'bg-purple-100',
  },
  divers: {
    icon: <MiscIcon />,
    bgBarClassName: 'bg-yellow-800',
    bgLightClassName: 'bg-yellow-50',
    bgIconClassName: 'bg-yellow-100',
  },
} as const

function getFormattedPercentages({
  values,
  total,
  locale,
}: {
  values: number[]
  total: number
  locale: Locale
}) {
  // We work on a base 1000 to keep one decimal place using integers (100.0% = 1000)
  const roundedPercentagesAtOneDecimal = values.map((v) =>
    Math.round((v / total) * 1000)
  )

  // Calculate the difference between the sum of rounded values and 1000
  const sumDifference =
    1000 - roundedPercentagesAtOneDecimal.reduce((acc, val) => acc + val, 0)

  // Adjust the largest value to absorb the rounding error
  if (values.length > 0) {
    const indexOfLargestValue = roundedPercentagesAtOneDecimal.indexOf(
      Math.max(...roundedPercentagesAtOneDecimal)
    )
    roundedPercentagesAtOneDecimal[indexOfLargestValue] += sumDifference
  }

  const percentFormatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  })

  return roundedPercentagesAtOneDecimal.map((v) =>
    percentFormatter.format(v / 1000)
  )
}

export function getCategoriesDisplayData({
  computedResults,
  rules,
  metric = carboneMetric,
  locale,
  t,
}: {
  computedResults: ComputedResults
  rules: Partial<NGCRules>
  metric?: Metric
  locale: Locale
  t?: (key: string) => string
}): CategoryDisplayData[] {
  const categoriesData = computedResults[metric].categories
  const subcategoriesData = computedResults[metric].subcategories
  const totalBilan = computedResults[metric].bilan

  const categories = orderedCategories.filter((cat) => categoriesData[cat] > 0)
  const maxValue = Math.max(...Object.values(categoriesData))

  const displayPercentages = getFormattedPercentages({
    values: categories.map((c) => categoriesData[c]),
    total: totalBilan,
    locale,
  })

  return categories.map((dottedName, i) => {
    const value = categoriesData[dottedName]
    const meta = CATEGORIES_MAPPER[dottedName as keyof typeof CATEGORIES_MAPPER]

    return {
      dottedName,
      title: getRuleTitle({ ...rules[dottedName], dottedName }),
      icon: meta.icon,
      bgBarClassName: meta.bgBarClassName,
      bgLightClassName: meta.bgLightClassName,
      bgIconClassName: meta.bgIconClassName,
      percentage: (value / maxValue) * 100,
      displayPercentage: displayPercentages[i],
      subcategories: getSubcategoriesDisplayData({
        categoryDottedName: dottedName,
        categoryValue: value,
        subcategoriesData,
        rules,
        metric,
        locale,
        t,
      }),
      ...formatFootprint(value, {
        metric,
        t,
      }),
    }
  })
}

function getSubcategoriesDisplayData({
  categoryDottedName,
  categoryValue,
  subcategoriesData,
  rules,
  metric = carboneMetric,
  locale,
  t,
}: {
  categoryDottedName: DottedName
  categoryValue: number
  subcategoriesData?: Record<DottedName, number>
  rules: Partial<NGCRules>
  metric?: Metric
  locale: Locale
  t?: (key: string) => string
}): SubcategoryDisplayData[] {
  if (!subcategoriesData) return []

  const entries = (Object.entries(subcategoriesData) as [DottedName, number][])
    .filter(
      ([dn, v]) => dn.startsWith(categoryDottedName) && rules[dn] && v > 0
    )
    .sort(([, a], [, b]) => b - a)

  const displayPercentages = getFormattedPercentages({
    values: entries.map(([, v]) => v),
    total: categoryValue,
    locale,
  })

  return entries.map(([dottedName, value], i) => {
    return {
      dottedName,
      title: getRuleTitle({ ...rules[dottedName], dottedName }),
      percentage: (value / categoryValue) * 100,
      displayPercentage: displayPercentages[i],
      ...formatFootprint(value, {
        metric,
        t,
      }),
    }
  })
}
