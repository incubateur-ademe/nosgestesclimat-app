import type { Simulation } from '@/helpers/server/model/simulations'
import type { ParticipantSimulationSummary } from '@/types/groups'

export function isFullSimulation(
  simulation: Simulation | ParticipantSimulationSummary
): simulation is Simulation {
  return 'situation' in simulation
}
