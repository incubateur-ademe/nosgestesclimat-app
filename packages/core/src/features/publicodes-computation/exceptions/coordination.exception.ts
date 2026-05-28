import { Exception } from '../../../exception.ts'

export class SimulationComputationFail extends Exception<{
  simulationId: string
}> {
  level = 'fatal' as const
}
