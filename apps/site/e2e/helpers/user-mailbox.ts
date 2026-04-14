import { MailiskClient } from 'mailisk'

if (!process.env.MAILISK_NAMESPACE || !process.env.MAILISK_API_KEY) {
  throw new Error(
    `MAILISK_NAMESPACE and MAILISK_API_KEY are required.
    MAILISK_NAMESPACE: ${!!process.env.MAILISK_NAMESPACE}
    MAILISK_API_KEY: ${!!process.env.MAILISK_API_KEY}`
  )
}

const mailisk = new MailiskClient({ apiKey: process.env.MAILISK_API_KEY })

export class UserMailbox {
  constructor(private readonly email: string) {}

  async getVerificationCode() {
    const email = await this.lookup('Votre code de vérification est le')
    if (!email) {
      throw new Error(`No verification code received`)
    }
    const codeMatch = /\d{6}/.exec(email.subject!)
    const code = codeMatch![0]
    return code
  }

  async lookup(subject: string) {
    const { data: emails } = await mailisk.searchInbox(
      process.env.MAILISK_NAMESPACE!,
      {
        to_addr_prefix: this.email,
        subject_includes: subject,
      }
    )
    const email = emails[0]
    if (!email) {
      return undefined
    }
    return email
  }
}
