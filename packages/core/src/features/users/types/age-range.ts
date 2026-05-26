import { picklist } from 'valibot'

const ageRangeValues = [
  'under_18',
  '18-24',
  '25-34',
  '35-49',
  '50-64',
  'over_65',
  'undisclosed',
] as const

export const AgeRangeSchema = picklist(ageRangeValues)

export type AgeRange = (typeof ageRangeValues)[number]
