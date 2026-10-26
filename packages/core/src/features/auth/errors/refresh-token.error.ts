import { DomainError } from '../../../lib/errors.ts'

/**
 * The rewrite matched no live row: the key is unknown, expired, revoked, or
 * already replaced by another request.
 */
export class RefreshTokenNotFoundError extends DomainError<'refresh_token_not_found'> {
  constructor() {
    super('refresh_token_not_found', 'No live session carries this key')
  }
}
