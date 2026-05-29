import { Exception } from '../../../exception.ts'

export class NoCompletedSimulationForUserException extends Exception<{
  userId: string
}> {
  level = 'warning' as const
}
