import { findSimulationComputation } from '../repositories/simulation-computations.repository.ts'

export const getSimulationComputation = (simulationId: string) =>
  findSimulationComputation(simulationId)
