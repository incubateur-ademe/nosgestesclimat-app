import { DomainError } from '../../lib/errors.ts'

export class EmailRequestError extends DomainError<'email_request_error'> {
  constructor(
    message: string = 'Email provider request failed',
    options?: { cause?: unknown }
  ) {
    super('email_request_error', message)
    if (options?.cause !== undefined) {
      this.cause = options.cause
    }
  }
}
