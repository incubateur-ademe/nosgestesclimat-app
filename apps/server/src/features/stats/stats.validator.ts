import * as v from 'valibot'
import { PERIODS } from './stats.constant.ts'

export const PeriodValues = [
  PERIODS.year,
  PERIODS.month,
  PERIODS.week,
  PERIODS.day,
] as const

export const NorthstarStatsFetchQuery = v.strictObject({
  periodicity: v.optional(v.picklist(PeriodValues), PERIODS.month),
  since: v.optional(
    v.nullable(
      v.pipe(
        v.unknown(),
        v.transform(Number),
        v.number(),
        v.integer(),
        v.minValue(1)
      )
    ),
    null
  ),
})

export type NorthstarStatsFetchQuery = v.InferOutput<
  typeof NorthstarStatsFetchQuery
>

export const NorthstarStatsFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: v.optional(v.strictObject({})),
  query: NorthstarStatsFetchQuery,
}
