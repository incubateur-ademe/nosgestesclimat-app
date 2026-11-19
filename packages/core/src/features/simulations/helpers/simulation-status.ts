import type { SimulationStatus } from '../../../prisma/generated/client.ts'

/**
 * Derives the status persisted alongside a progression value. Until the
 * targeted test exists, progression is the only lifecycle information a
 * simulation carries, so the two columns are always written together.
 */
export const simulationStatusFromProgression = (
  progression: number
): SimulationStatus => {
  if (progression === 0) return 'not_started'
  if (progression === 1) return 'full_result_seen'
  return 'answering_major_questions'
}
