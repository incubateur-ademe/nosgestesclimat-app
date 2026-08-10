import * as v from 'valibot'

const CategoriesSchema = v.strictObject({
  alimentation: v.number(),
  transport: v.number(),
  logement: v.number(),
  divers: v.number(),
  'services sociétaux': v.number(),
})

const MetricComputedResultSchema = v.strictObject({
  bilan: v.number(),
  categories: CategoriesSchema,
  subcategories: v.record(v.string(), v.number()),
})

export const ComputedResultSchema = v.strictObject({
  carbone: MetricComputedResultSchema,
  eau: MetricComputedResultSchema,
})

export type ComputedResultSchema = v.InferOutput<typeof ComputedResultSchema>

/**
 * A simulation's `computedResults` is only exploitable by the frontend when it
 * matches the current carbone/eau shape. Legacy simulations predating this
 * shape are kept in the database but exposed as if they did not exist.
 */
export const hasValidComputedResults = (simulation: {
  computedResults?: unknown
}): boolean =>
  v.safeParse(ComputedResultSchema, simulation.computedResults).success
