import { carboneMetric, eauMetric } from '@/constants/model/metric'
import type { Metric } from '@/publicodes-state/types'

type Options = {
  localize?: boolean
  locale?: string
  maximumFractionDigits?: number
  shouldUseAbbreviation?: boolean
  t?: (key: string) => string
  shouldDivideBy365?: boolean
} & (
  | {
      metric: Metric
      unit?: 'auto'
    }
  | {
      metric?: undefined
      unit?: CarbonUnit | 'auto'
    }
  | {
      metric: 'carbone'
      unit?: CarbonUnit | 'auto'
    }
  | {
      metric: 'eau'
      unit?: WaterUnit | 'auto'
    }
)

type CarbonUnit = 'g' | 'kg' | 't'
type WaterUnit = 'l'

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
    unit = 'auto',
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
        unit: unit as WaterUnit | 'auto',
      })
    case carboneMetric:
    default:
      return formatCarbon(value, {
        localize,
        locale,
        maximumFractionDigits: maximumFractionDigits ?? 1,
        shouldUseAbbreviation,
        t,
        unit: unit as CarbonUnit | 'auto',
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
    unit: unitOption,
  }: {
    localize: boolean
    locale: string
    maximumFractionDigits: number
    shouldUseAbbreviation: boolean
    t: (key: string) => string
    unit: CarbonUnit | 'auto'
  }
): { formattedValue: string; unit: string | null; negative: boolean } {
  const numberValue = Number(value)

  const converted = convertToUnit(numberValue, unitOption)
  let amount = converted.amount
  let unitText: string = converted.unit

  if (converted.unit === 'kg') {
    amount = Math.round(amount)
  } else if (converted.unit === 't') {
    unitText = shouldUseAbbreviation
      ? 't'
      : // Doesn't work perfectly. For example 1.950.toFixed(1) = 1.9 but 1.950.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) = 2
        Number(amount.toFixed(maximumFractionDigits)) < 2
        ? t('tonne')
        : t('tonnes')
  }

  return {
    formattedValue: localize
      ? amount.toLocaleString(locale, {
          maximumFractionDigits,
        })
      : amount.toFixed(maximumFractionDigits),
    unit: unitText,
    negative: amount < 0,
  }
}

function convertToUnit(
  amountInKg: number,
  unit: CarbonUnit | 'auto'
): { amount: number; unit: CarbonUnit } {
  switch (unit) {
    case 'auto': {
      const abs = Math.abs(amountInKg)
      if (abs > 0 && abs < 1) return convertToUnit(amountInKg, 'g')
      if (abs >= 1 && abs < 1000) return convertToUnit(amountInKg, 'kg')
      return convertToUnit(amountInKg, 't')
    }
    case 'g':
      return { amount: amountInKg * 1000, unit: 'g' }
    case 'kg':
      return { amount: amountInKg, unit: 'kg' }
    case 't':
      return { amount: amountInKg / 1000, unit: 't' }
    default:
      unit satisfies never
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported unit: ${unit}`)
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
    unit?: WaterUnit | 'auto'
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
