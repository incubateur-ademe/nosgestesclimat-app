import { Exception } from '../../../exception.ts'

export class TokenExpiredException extends Exception {
  level = 'error' as const
}
