import * as v from 'valibot'

export const ProgressionSchema = v.pipe(
  v.number(),
  v.minValue(0),
  v.maxValue(1)
)
