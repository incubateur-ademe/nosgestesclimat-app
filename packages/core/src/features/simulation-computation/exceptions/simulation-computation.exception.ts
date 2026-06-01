import { Exception } from '../../../exception.js'
import type { Model } from '../../simulations/types/model.ts'

export class SimulationComputationFail extends Exception<{
  simulationId: string
}> {
  level = 'fatal' as const
}

export class ComputationAlreadyExists extends Exception<{
  simulationId: string
}> {
  level = 'error' as const
}

export class SimulationNotFinished extends Exception<{
  simulationId: string
  progression: number
}> {
  level = 'error' as const
}

export class UnsupportedModel extends Exception<{
  model: Model
}> {
  level = 'warning' as const
}
