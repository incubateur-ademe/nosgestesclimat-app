import { carboneMetric, eauMetric } from '@/constants/model/metric'
import type { Metric } from '@/publicodes-state/types'

interface Options {
  localize?: boolean
  locale?: string
  maximumFractionDigits?: number
  shouldUseAbbreviation?: boolean
  t?: (key: string) => string
  metric?: Metric
  shouldDivideBy365?: boolean
}

export function formatFootprint(
  value: string | number,
  {
    localize = true,
    locale = 'fr-FR',
    maximumFractionDigits,
    shouldUseAbbreviation = false,
    t = (key) => key,
    metric = carboneMetric,
    shouldDivideBy365 = true,
  }: Options
): {
  formattedValue: string
  unit: string | null
  negative: boolean
} {
  switch (metric) {
    case eauMetric:
      return formatWater(value, {
        localize,
        locale,
        maximumFractionDigits: maximumFractionDigits ?? 0,
        shouldUseAbbreviation,
        t,
        shouldDivideBy365,
      })
    case carboneMetric:
    default:
      return formatCarbon(value, {
        localize,
        locale,
        maximumFractionDigits: maximumFractionDigits ?? 1,
        shouldUseAbbreviation,
        t,
      })
  }
}

// ---------------------------------------------------------------------------
// Carbon formatting (g / kg / tonnes)
// ---------------------------------------------------------------------------

function formatCarbon(
  value: string | number,
  {
    localize,
    locale,
    maximumFractionDigits,
    shouldUseAbbreviation,
    t,
  }: {
    localize: boolean
    locale: string
    maximumFractionDigits: number
    shouldUseAbbreviation: boolean
    t: (key: string) => string
  }
): { formattedValue: string; unit: string | null; negative: boolean } {
  const numberValue = Number(value)

  const negative = numberValue < 0
  const absNumberValue = Math.abs(numberValue)

  let tempValue = 0
  let unit: string | null = null

  if (absNumberValue > 0 && absNumberValue < 1) {
    tempValue = absNumberValue * 1000
    unit = 'g'
  }

  if (absNumberValue >= 1 && absNumberValue < 1000) {
    tempValue = Math.round(absNumberValue)
    unit = 'kg'
  }

  if (absNumberValue >= 1000) {
    tempValue = absNumberValue / 1000
    unit = shouldUseAbbreviation
      ? 't'
      : // Doesn't work perfectly. For example 1.950.toFixed(1) = 1.9 but 1.950.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) = 2
        Number(tempValue.toFixed(maximumFractionDigits)) < 2
        ? t('tonne')
        : t('tonnes')
  }

  if (negative) {
    tempValue = -tempValue
  }

  return {
    formattedValue: localize
      ? tempValue.toLocaleString(locale, {
          maximumFractionDigits,
        })
      : tempValue.toFixed(maximumFractionDigits),
    unit,
    negative,
  }
}

// ---------------------------------------------------------------------------
// Water formatting (litres)
// ---------------------------------------------------------------------------

function formatWater(
  value: string | number,
  {
    localize,
    locale,
    maximumFractionDigits,
    shouldUseAbbreviation,
    t,
    shouldDivideBy365,
  }: {
    localize: boolean
    locale: string
    maximumFractionDigits: number
    shouldUseAbbreviation: boolean
    t: (key: string) => string
    shouldDivideBy365: boolean
  }
): { formattedValue: string; unit: string | null; negative: boolean } {
  const numberValue = shouldDivideBy365 ? Number(value) / 365 : Number(value)

  const negative = numberValue < 0
  const absoluteNumberValue = Math.abs(numberValue)

  const unit = shouldUseAbbreviation
    ? 'l'
    : // Doesn't work perfectly. For example 1.950.toFixed(1) = 1.9 but 1.950.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) = 2
      Number(absoluteNumberValue.toFixed(maximumFractionDigits)) < 2
      ? t('litre')
      : t('litres')

  return {
    formattedValue: localize
      ? numberValue.toLocaleString(locale, {
          maximumFractionDigits,
        })
      : numberValue.toFixed(maximumFractionDigits),
    unit,
    negative,
  }
}
