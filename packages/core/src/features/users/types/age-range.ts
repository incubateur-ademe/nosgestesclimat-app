import { z } from 'zod'

export const AgeRangeSchema = z.enum([
  'under_18',
  '18-24',
  '25-34',
  '35-49',
  '50-64',
  'over_65',
  'undisclosed',
])

export type AgeRange = z.infer<typeof AgeRangeSchema>
