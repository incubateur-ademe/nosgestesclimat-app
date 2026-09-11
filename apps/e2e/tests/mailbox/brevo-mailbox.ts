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
  sentAt?: string
}

interface BrevoResponse {
  messages?: BrevoMessage[]
}

export class BrevoMailbox implements MailboxAdapter {
  private readonly url: string
  private readonly token: string
  // The caller polls every second: log an upstream failure once per distinct
  // message instead of once per attempt.
  private readonly loggedErrors = new Set<string>()

  constructor() {
    // Resolved in the constructor (not at module load) so importing this file
    // does not throw when E2E_MAILBOX=stub.
    this.url = env('FGP_BREVO_READONLY_URL').replace(/\/$/, '')
    this.token = env('FGP_BREVO_READONLY_TOKEN')
  }

  // Brevo's transactional log exposes the rendered subject, and the
  // verification email template interpolates the 6-digit code into the subject
  // line. We rely on that invariant (subject contains the code) rather than
  // fetching the full email body.
  async lookup(
    email: string,
    templateId: number
  ): Promise<EmailRecord | undefined> {
    const params = new URLSearchParams({
      email,
      templateId: String(templateId),
    })

    const response = await fetch(`${this.url}/v3/smtp/emails?${params}`, {
      headers: { 'X-FGP-Key': this.token },
    })

    if (!response.ok) {
      const body = await response.text()

      // A rejected read never fixes itself by polling (rotated FGP blob, Brevo
      // key revoked, Brevo egress IP not authorised…): fail with the upstream
      // reason rather than ending on a misleading "No verification code
      // received". Production case: Brevo answers 401 "unrecognised IP
      // address" when FGP's egress IP is missing from the account's authorised
      // IPs (https://app.brevo.com/security/authorised_ips).
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Mailbox read rejected (HTTP ${response.status}): ${body}`
        )
      }

      // Transient (5xx, 429…): the caller retries until its deadline.
      this.warnOnce(`Mailbox read failed (HTTP ${response.status}): ${body}`)

      return undefined
    }

    const data = (await response.json()) as BrevoResponse
    const messages = (data.messages ?? []).sort(
      (a, b) =>
        (b.sentAt ? new Date(b.sentAt).getTime() : 0) -
        (a.sentAt ? new Date(a.sentAt).getTime() : 0)
    )

    return messages.length > 0 ? { subject: messages[0].subject } : undefined
  }

  private warnOnce(message: string) {
    if (this.loggedErrors.has(message)) {
      return
    }

    this.loggedErrors.add(message)
    console.warn(`[mailbox] ${message}`)
  }
}
