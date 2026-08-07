import { MailiskClient } from 'mailisk'

if (!process.env.MAILISK_NAMESPACE || !process.env.MAILISK_API_KEY) {
  throw new Error(
    `MAILISK_NAMESPACE and MAILISK_API_KEY are required.
    MAILISK_NAMESPACE: ${!!process.env.MAILISK_NAMESPACE}
    MAILISK_API_KEY: ${!!process.env.MAILISK_API_KEY}`
  )
}

const mailisk = new MailiskClient({ apiKey: process.env.MAILISK_API_KEY })

// Mailisk does not export its `Email` type.
interface Email {
  subject?: string
}

export class UserMailbox {
  constructor(private readonly email: string) {}

  async getVerificationCode() {
    // The verification email can take a few seconds to reach the mailbox;
    // retry the lookup until it shows up instead of failing on first query.
    const deadline = Date.now() + 30_000
    let email: Email | undefined
    while (!email && Date.now() < deadline) {
      email = await this.lookup('Votre code de vérification est le')
      if (!email) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    if (!email) {
      throw new Error(`No verification code received`)
    }
    const codeMatch = /\d{6}/.exec(email.subject!)
    const code = codeMatch![0]
    return code
  }

  async lookup(subject: string): Promise<Email | undefined> {
    const { data: emails } = await mailisk.searchInbox(
      process.env.MAILISK_NAMESPACE!,
      {
        to_addr_prefix: this.email,
        subject_includes: subject,
      }
    )
    // Mailisk types `emails[0]` as `Email`, but an empty inbox yields
    // undefined at runtime.
    return emails[0] as Email | undefined
  }
}
