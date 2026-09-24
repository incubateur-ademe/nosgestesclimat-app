import type { EmailRecord, MailboxAdapter } from './types'

const env = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required when E2E_MAILBOX=brevo`)
  }
  return value
}

interface BrevoMessage {
  subject?: string
  /** Send time, ISO 8601 (e.g. 2026-09-13T16:31:42.475+02:00). */
  date?: string
}

interface BrevoResponse {
  transactionalEmails?: BrevoMessage[]
}

// Brevo allows 2 req/s on `GET /v3/smtp/emails`, and the 6 processes of the CI
// (Chrome + Firefox, 3 workers each) read concurrently: 8 s between requests per
// process stays around 0.75 req/s.
const MIN_INTERVAL_MS = 8_000

// Brevo indexes sends with a variable delay, up to about a minute: the deadline
// sits above it, so a slow index is waited out instead of read as "no email".
const LOOKUP_DEADLINE_MS = 90_000

// A lookup may consume its whole deadline, and the rest of a test (simulation,
// email round-trip, clicks) runs around it: the per-test budget covers both.
// The Playwright timeout and `setup.setTimeout` both derive from this value, so
// no test can end while a mailbox read is still in flight.
export const BREVO_TEST_TIMEOUT_MS = 240_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let lastRequestAt = 0

const throttle = async () => {
  const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now()
  if (wait > 0) {
    await sleep(wait)
  }
  lastRequestAt = Date.now()
}

export class BrevoMailbox implements MailboxAdapter {
  private readonly url: string
  private readonly token: string
  // Retries repeat the same failure: warn once per distinct message.
  private readonly loggedErrors = new Set<string>()

  constructor() {
    // Resolved here (not at module load) so importing this file does not throw
    // when E2E_MAILBOX=stub.
    this.url = env('FGP_BREVO_READONLY_URL').replace(/\/$/, '')
    this.token = env('FGP_BREVO_READONLY_TOKEN')
  }

  async lookup(
    email: string,
    templateId: number
  ): Promise<EmailRecord | undefined> {
    const deadline = Date.now() + LOOKUP_DEADLINE_MS
    let record: EmailRecord | undefined

    do {
      record = await this.fetchLastEmail(email, templateId)
    } while (!record && Date.now() < deadline)

    return record
  }

  // The verification template interpolates the code into the subject, so reading
  // the subject is enough.
  private async fetchLastEmail(
    email: string,
    templateId: number
  ): Promise<EmailRecord | undefined> {
    const params = new URLSearchParams({
      email,
      templateId: String(templateId),
    })

    await throttle()

    const response = await fetch(`${this.url}/v3/smtp/emails?${params}`, {
      headers: { 'X-FGP-Key': this.token },
    })

    if (!response.ok) {
      const body = await response.text()

      // 429, 5xx and even 401/403: Brevo rejects isolated requests (rate limit,
      // egress IP), so let the next round retry. The body is what tells a real
      // configuration error (rotated blob, revoked key…) from a transient one.
      this.warnOnce(`Mailbox read failed (HTTP ${response.status}): ${body}`)

      return undefined
    }

    const data = (await response.json()) as BrevoResponse
    if (!Array.isArray(data.transactionalEmails)) {
      // `{}` means "no email for these criteria yet"; any other shape is
      // unexpected and worth reporting.
      const keys = Object.keys(data)
      if (keys.length > 0) {
        this.warnOnce(
          `Brevo: réponse sans 'transactionalEmails' (clés: ${keys.join(', ')})`
        )
      }
      return undefined
    }

    // A code can be requested twice for the same address: keep the latest one.
    const [latest] = [...data.transactionalEmails].sort(
      (a, b) =>
        (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0)
    )

    return latest ? { subject: latest.subject } : undefined
  }

  private warnOnce(message: string) {
    if (this.loggedErrors.has(message)) {
      return
    }

    this.loggedErrors.add(message)
    console.warn(`[mailbox] ${message}`)
  }
}
