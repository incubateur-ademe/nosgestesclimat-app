import { Exception } from '../../../exception.ts'

export class BrevoRequestException extends Exception<{
  path: string
  status?: number
  body?: string
}> {}
