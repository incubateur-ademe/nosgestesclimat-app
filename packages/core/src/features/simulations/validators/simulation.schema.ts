import * as v from 'valibot'

/** TODO: harden this schema by reusing known regexes and branded type */
export const ModelSchema = v.string()

export const ProgressionSchema = v.pipe(
  v.number(),
  v.minValue(0),
  v.maxValue(1)
)
