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
    // Emails take a few seconds to appear, and the adapter throttles its calls
    // (Brevo: 2 req/s total): poll until the deadline.
    const deadline = Date.now() + 30_000
    let email: EmailRecord | undefined
    while (!email && Date.now() < deadline) {
      email = await adapter.lookup(this.email, templateId)
      if (!email) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    return email
  }
}
