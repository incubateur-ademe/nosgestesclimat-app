import type { EmailRecord, MailboxAdapter } from './types'

const mailboxUrl = process.env.E2E_MAILBOX_URL ?? 'http://localhost:3002'

// The emails read here (verification code, organisation confirmation…) are
// dispatched by a background task scheduled once the triggering action has
// responded (`after` from next/server, cf. the site's createVerificationCode):
// the UI that unlocks the read is already on screen when the send has not
// reached the mock yet. A single lookup would read that delay as "no email"
// — the same race the Brevo adapter waits out with its LOOKUP_DEADLINE_MS.
const LOOKUP_DEADLINE_MS = 10_000
const POLL_INTERVAL_MS = 100

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface StoredEmail {
  params?: Record<string, unknown>
}

export class StubMailbox implements MailboxAdapter {
  async lookup(
    email: string,
    templateId: number
  ): Promise<EmailRecord | undefined> {
    const deadline = Date.now() + LOOKUP_DEADLINE_MS

    let record: EmailRecord | undefined
    do {
      record = await this.fetchLastEmail(email, templateId)
      if (!record) {
        await sleep(POLL_INTERVAL_MS)
      }
    } while (!record && Date.now() < deadline)

    return record
  }

  private async fetchLastEmail(
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
