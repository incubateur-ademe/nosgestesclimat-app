import type { VerificationCodeUsage } from '../../../prisma/generated/client.ts'

export type VerificationCode = {
  id: string
  email: string
  /**
   * A code created for one usage never cannot be used for another.
   */
  usage: VerificationCodeUsage
  code: string
  expirationDate: Date
}
