import type { EmailRecord, MailboxAdapter } from './types'

const API_URL = 'https://api.mailisk.com/api/emails'

// Mailisk holds the request until the email arrives (it delivers in seconds):
// the timeout is the only bound.
const LOOKUP_TIMEOUT_MS = 60_000

interface SearchInboxResponse {
  data?: { subject?: string }[]
}

export class MailiskMailbox implements MailboxAdapter {
  constructor(
    private readonly namespace = process.env
      .E2E_MAILBOX_MAILISK_NAMESPACE as string,
    private readonly apiKey = process.env.E2E_MAILBOX_MAILISK_API_KEY as string
  ) {}

  // Mailisk has no template id: a test generates one address and receives a
  // single email there, so the recipient is the filter.
  async lookup(email: string): Promise<EmailRecord | undefined> {
    const params = new URLSearchParams({
      wait: 'true',
      limit: '1',
      to_addr_prefix: email,
    })

    let response: Response
    try {
      response = await fetch(`${API_URL}/${this.namespace}/inbox?${params}`, {
        headers: { 'X-Api-Key': this.apiKey },
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      })
    } catch {
      return undefined
    }

    if (!response.ok) {
      throw new Error(
        `Mailisk inbox read failed: HTTP ${response.status} ${await response.text()}`
      )
    }

    const { data } = (await response.json()) as SearchInboxResponse
    return data?.[0] ? { subject: data[0].subject } : undefined
  }
}
