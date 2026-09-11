import type { EmailRecord, MailboxAdapter } from './types'

const mailboxUrl = process.env.E2E_MAILBOX_URL ?? 'http://localhost:3002'

interface StoredEmail {
  params?: Record<string, unknown>
}

export class StubMailbox implements MailboxAdapter {
  async lookup(
    email: string,
    templateId: number
  ): Promise<EmailRecord | undefined> {
    const params = new URLSearchParams({
      to: email,
      templateId: String(templateId),
    })

    let response: Response
    try {
      response = await fetch(`${mailboxUrl}/emails?${params}`)
    } catch {
      throw new Error(
        `Impossible de joindre le mock (boîte mail) sur ${mailboxUrl}. ` +
          `As-tu lancé \`pnpm -F @nosgestesclimat/e2e mock\` ?`
      )
    }
    const emails = (await response.json()) as StoredEmail[]

    return emails.length > 0 ? { params: emails[0].params } : undefined
  }
}
