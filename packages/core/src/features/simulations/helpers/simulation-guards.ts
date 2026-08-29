import type { ComputedResultSchema } from '../validators/computed-results.schema.ts'

/**
 * A simulation whose carbon footprint is zero is the symptom of a broken
 * computation or a pristine simulation, never of a real answer set: refusing
 * to persist it keeps the bad value from overwriting the answers already
 * stored.
 */
export const hasZeroCarbonFootprint = (
  computedResults: ComputedResultSchema
): boolean => computedResults.carbone.bilan === 0

/**
 * A completed simulation is immutable: once its progression reached 1, it
 * can no longer be updated, even to stay completed.
 */
export const isSimulationCompleted = (current: number): boolean => current === 1
