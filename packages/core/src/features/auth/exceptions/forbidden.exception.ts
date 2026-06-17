import { Exception } from '../../../exception.ts'

export class ForbiddenException extends Exception<{
  resourceId?: string
  resourceType?: string
}> {}
