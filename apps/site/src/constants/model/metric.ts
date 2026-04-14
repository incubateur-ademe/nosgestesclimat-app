import type { Metric } from '@/publicodes-state/types'

export const carboneMetric = 'carbone' as const

export const eauMetric = 'eau' as const

export const metrics: Metric[] = [carboneMetric, eauMetric]
