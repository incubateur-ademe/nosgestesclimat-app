import {
  parseModel,
  type ModelString,
} from '../../models/helpers/model-versions.ts'
import {
  hasValidComputedResults,
  type ComputedResults,
} from './computed-results.schema.ts'

/**
 * A simulation row is only valid when its model string can be parsed and its
 * `computedResults` match the current shape. Legacy simulations predating
 * these constraints are kept in the database but exposed as if they did not
 * exist.
 */
export const isValidSimulation = <
  Row extends { model: string; computedResults?: unknown },
>(
  row: Row
): row is Row & { model: ModelString; computedResults: ComputedResults } =>
  parseModel(row.model) !== null && hasValidComputedResults(row)
