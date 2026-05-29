import { Exception } from '../../../exception.ts'

abstract class SimulationException extends Exception<{
  simulationId: string
}> {}

export class SimulationNotFoundException extends SimulationException {}
export class ImmutableSimulationException extends SimulationException {}
export class NotAuthorizedSimulationException extends SimulationException {}
