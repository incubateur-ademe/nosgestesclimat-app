import { parseModelString } from '../repository/model.mapper.ts'
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
): row is Row & { computedResults: ComputedResults } =>
  parseModelString(row.model) !== null && hasValidComputedResults(row)
