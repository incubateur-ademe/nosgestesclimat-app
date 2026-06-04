import { Exception } from '../../../exception.js'
import type { Model } from '../../simulations/types/model.ts'

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

export class UnsupportedModelException extends Exception<{
  model: Model
}> {
  level = 'warning' as const
}
