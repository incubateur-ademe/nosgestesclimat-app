import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import type { Locale } from '@/i18nConfig'
import type { TFunction } from 'i18next'
import { THIRD_OBJECTIVE } from '../objective/_constants/objectives'

// Average of the 607 609 simulations completed between 2025-10-01 and
// 2026-09-30 (7 946 kg CO₂e), rounded to 8 t. Hardcoded for now.
export const AVERAGE_FOOTPRINT_KG = 8000
const CLOSE_TO_AVERAGE_THRESHOLD_KG = 7000

// Keeps a very small footprint visible next to the average bar
const MIN_BAR_PERCENT = 8

// Height of a value label, in percent of the vertical chart
const VALUE_LABEL_HEIGHT_PERCENT = 18

export type FootprintComparisonLevel = 'above' | 'close' | 'below'

export function getFootprintComparison(footprintKg: number): {
  level: FootprintComparisonLevel
  deltaKg: number
} {
  // The gap is displayed in tenths of a tonne, like the footprint itself
  const deltaKg = Math.round(footprintKg / 100) * 100 - AVERAGE_FOOTPRINT_KG

  if (footprintKg > AVERAGE_FOOTPRINT_KG) return { level: 'above', deltaKg }
  if (footprintKg >= CLOSE_TO_AVERAGE_THRESHOLD_KG) {
    return { level: 'close', deltaKg }
  }
  return { level: 'below', deltaKg }
}

/**
 * Bar lengths of the comparison chart, in percent of the chart: the longest
 * bar fills it. The 2050 objective (2 t) is always under the average.
 */
export function getComparisonBarPercents(footprintKg: number): {
  footprint: number
  average: number
  objective: number
} {
  const scaleMax = Math.max(footprintKg, AVERAGE_FOOTPRINT_KG)

  return {
    footprint: Math.max((footprintKg / scaleMax) * 100, MIN_BAR_PERCENT),
    average: (AVERAGE_FOOTPRINT_KG / scaleMax) * 100,
    objective: (THIRD_OBJECTIVE.value / scaleMax) * 100,
  }
}

export interface FootprintComparisonChartData {
  percents: ReturnType<typeof getComparisonBarPercents>
  level: FootprintComparisonLevel
  deltaKg: number
  /** Signed gap to the average, e.g. "+2 t" or "−1 t" */
  deltaLabel: string
  ariaLabel: string
  /** Whether the footprint value must move above the average line */
  isFootprintValueOnAverageLine: boolean
  /** Lower and upper bounds of the bracket between footprint and average */
  lowPercent: number
  highPercent: number
  /** Formats a kg amount as a tonne label; abbreviated unless told otherwise */
  formatTons: (value: number, shouldUseAbbreviation?: boolean) => string
}

export function getFootprintComparisonChartData({
  value,
  locale,
  t,
}: {
  value: number
  locale: Locale
  t: TFunction
}): FootprintComparisonChartData {
  const { level, deltaKg } = getFootprintComparison(value)
  const percents = getComparisonBarPercents(value)

  // Abbreviated units keep the labels as narrow as the bars, the accessible
  // label spells them out
  const formatTons = (kg: number, shouldUseAbbreviation = true) =>
    formatTonsLabel(kg, locale, t, shouldUseAbbreviation)

  return {
    percents,
    level,
    deltaKg,
    deltaLabel: `${deltaKg > 0 ? '+' : '\u2212'}${formatTons(Math.abs(deltaKg))}`,
    ariaLabel: t(
      'results.footprintBlock.carbone.chart.label',
      'Votre empreinte : {{footprint}}. Moyenne de nos utilisateurs : {{average}}. Objectif 2050 : {{objective}}.',
      {
        footprint: formatTonsLabel(value, locale, t, false),
        average: formatTonsLabel(AVERAGE_FOOTPRINT_KG, locale, t, false),
        objective: formatTonsLabel(THIRD_OBJECTIVE.value, locale, t, false),
      }
    ),
    // Just under the average, the footprint value would sit on the dashed
    // line: it goes above it instead, level with the average value
    isFootprintValueOnAverageLine:
      percents.footprint < percents.average &&
      percents.average - percents.footprint < VALUE_LABEL_HEIGHT_PERCENT,
    lowPercent: Math.min(percents.footprint, percents.average),
    highPercent: Math.max(percents.footprint, percents.average),
    formatTons,
  }
}

function formatTonsLabel(
  kg: number,
  locale: Locale,
  t: TFunction,
  shouldUseAbbreviation = true
) {
  const { formattedValue, unit } = formatFootprint(kg, {
    locale,
    t,
    metric: 'carbone',
    unit: 't',
    shouldUseAbbreviation,
  })
  return `${formattedValue} ${unit}`
}
