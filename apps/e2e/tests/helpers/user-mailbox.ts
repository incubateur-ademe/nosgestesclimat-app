import { TemplateIds } from '@nosgestesclimat/core/features/emails/email.constant'
import { createMailboxAdapter } from '../mailbox'
import type { EmailRecord } from '../mailbox/types'

const adapter = createMailboxAdapter()

export class UserMailbox {
  constructor(private readonly email: string) {}

  async getVerificationCode(): Promise<string> {
    const email = await this.lookup(TemplateIds.fr.VERIFICATION_CODE)
    const paramCode = email?.params?.VERIFICATION_CODE
    if (typeof paramCode === 'string') {
      return paramCode
    }
    const codeMatch = /\d{6}/.exec(email?.subject ?? '')
    if (!codeMatch) {
      throw new Error(`No verification code received`)
    }
    return codeMatch[0]
  }

  async lookup(templateId: number): Promise<EmailRecord | undefined> {
    return adapter.lookup(this.email, templateId)
  }
}
