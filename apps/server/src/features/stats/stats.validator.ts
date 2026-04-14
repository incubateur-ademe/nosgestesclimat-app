import { z } from 'zod'
import { PERIODS } from './stats.constant.js'

export const NorthstarStatsFetchQuery = z
  .object({
    periodicity: z.enum(PERIODS).default(PERIODS.month),
    since: z.coerce.number().int().positive().nullable().default(null),
  })
  .strict()

export type NorthstarStatsFetchQuery = z.infer<typeof NorthstarStatsFetchQuery>

export const NorthstarStatsFetchValidator = {
  body: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
  query: NorthstarStatsFetchQuery,
}
