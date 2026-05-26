import { type InferOutput, picklist } from 'valibot'

export const AgeRangeSchema = picklist([
  'under_18',
  '18-24',
  '25-34',
  '35-49',
  '50-64',
  'over_65',
  'undisclosed',
])

export type AgeRange = InferOutput<typeof AgeRangeSchema>
