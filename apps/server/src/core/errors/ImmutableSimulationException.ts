export class ImmutableSimulationException extends Error {
  constructor(message?: string) {
    super(message || 'Simulation is complete and immutable')
  }
}
