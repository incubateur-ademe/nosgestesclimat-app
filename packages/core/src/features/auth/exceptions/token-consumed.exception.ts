import { Exception } from '../../../exception.ts'

export class TokenConsumedException extends Exception {
  level = 'error' as const
}
