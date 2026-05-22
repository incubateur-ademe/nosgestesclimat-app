import * as v from 'valibot'
import { PERIODS } from './stats.constant.ts'

export const NorthstarStatsFetchQuery = v.strictObject({
  periodicity: v.optional(v.enum(PERIODS), PERIODS.month),
  since: v.optional(
    v.nullable(
      v.pipe(v.unknown(), v.transform(Number), v.integer(), v.minValue(1))
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
