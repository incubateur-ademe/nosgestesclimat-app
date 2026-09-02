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

export const ComputedResultsSchema = v.strictObject({
  carbone: MetricComputedResultSchema,
  eau: MetricComputedResultSchema,
})

export type ComputedResults = v.InferOutput<typeof ComputedResultsSchema>

/**
 * A simulation's `computedResults` is only exploitable by the frontend when it
 * matches the current carbone/eau shape. Legacy simulations predating this
 * shape are kept in the database but exposed as if they did not exist.
 */
export const hasValidComputedResults = <
  Simulation extends { computedResults?: unknown },
>(
  simulation: Simulation
): simulation is Simulation & { computedResults: ComputedResults } =>
  v.safeParse(ComputedResultsSchema, simulation.computedResults).success
