import { picklist } from 'valibot'

const ageRangeValues = [
  'under_18',
  'age_18_24',
  'age_25_34',
  'age_35_49',
  'age_50_64',
  'over_65',
  'undisclosed',
] as const

export const AgeRangeSchema = picklist(ageRangeValues)

export type AgeRange = (typeof ageRangeValues)[number]
