import { DomainError } from '../../../lib/errors.ts'

export class ErasureWithoutFinalNoticeError extends DomainError<'erasure_without_final_notice'> {
  constructor() {
    super(
      'erasure_without_final_notice',
      'Accounts due for erasure without their final notice'
    )
  }
}
