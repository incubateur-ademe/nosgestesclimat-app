import type { Simulation, SimulationMode } from '../types/simulation.ts'

export function getSimulationMode(simulation: Simulation): SimulationMode {
  return simulation.model.region === 'ED' ? 'scolaire' : 'standard'
}
