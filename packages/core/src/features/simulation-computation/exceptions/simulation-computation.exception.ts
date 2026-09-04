import { Exception } from '../../../exception.ts'

export class SimulationComputationFailedException extends Exception<{
  simulationId: string
}> {
  level = 'fatal' as const
}

export class ComputationAlreadyExistsException extends Exception<{
  simulationId: string
}> {
  level = 'error' as const
}

export class SimulationNotFinishedException extends Exception<{
  simulationId: string
  progression: number
}> {
  level = 'error' as const
}
