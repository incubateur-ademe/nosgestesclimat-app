import { Exception } from '../../../exception.ts'

export class SimulationNotFound extends Exception<{
  simulationId: string
}> {
  level = 'error' as const
}

export class InvalidModelString extends Exception<{
  simulationId: string
  modelString: string
}> {
  level = 'error' as const
}
