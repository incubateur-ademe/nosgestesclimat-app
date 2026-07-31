export const GUIDE_CATEGORIES = [
  'alimentation',
  'divers',
  'logement',
  'numerique',
  'services-societaux',
  'transport',
] as const

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number]

export const isGuideCategory = (value: string): value is GuideCategory =>
  (GUIDE_CATEGORIES as readonly string[]).includes(value)
