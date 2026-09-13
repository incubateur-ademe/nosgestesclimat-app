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

// Brevo limite `GET /v3/smtp/emails` à 2 req/s (en-têtes `x-sib-ratelimit-*` sur
// les 429, pas de `Retry-After`). Chrome et Firefox tournent en parallèle, 3
// workers chacun : 6 process lisent en même temps, d'où 8 s d'espacement par
// process (~0,75 req/s au total).
const MIN_INTERVAL_MS = 8_000
const MAX_RATE_LIMIT_RETRIES = 3

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
  // The caller polls: log an upstream failure once per distinct message.
  private readonly loggedErrors = new Set<string>()

  constructor() {
    // Resolved here (not at module load) so importing this file does not throw
    // when E2E_MAILBOX=stub.
    this.url = env('FGP_BREVO_READONLY_URL').replace(/\/$/, '')
    this.token = env('FGP_BREVO_READONLY_TOKEN')
  }

  // The verification template interpolates the code into the subject line, so we
  // read the subject rather than fetching the full email body.
  async lookup(
    email: string,
    templateId: number
  ): Promise<EmailRecord | undefined> {
    const params = new URLSearchParams({
      email,
      templateId: String(templateId),
    })

    for (let attempt = 0; ; attempt++) {
      await throttle()

      const response = await fetch(`${this.url}/v3/smtp/emails?${params}`, {
        headers: { 'X-FGP-Key': this.token },
      })

      if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
        // `x-sib-ratelimit-reset` = secondes avant réouverture de la fenêtre.
        const reset = Number(response.headers.get('x-sib-ratelimit-reset'))
        await sleep((Number.isFinite(reset) ? reset : 1) * 1_000 + 250)
        continue
      }

      if (!response.ok) {
        const body = await response.text()

        // Un 401/403 ne se résout pas en réessayant : blob FGP tourné, clé Brevo
        // révoquée, ou IP de sortie absente de la liste autorisée du compte.
        // On remonte la raison plutôt qu'un « No verification code received ».
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Mailbox read rejected (HTTP ${response.status}): ${body}`
          )
        }

        // Transient (5xx, 429 épuisé…) : au tour suivant du caller.
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
  }

  private warnOnce(message: string) {
    if (this.loggedErrors.has(message)) {
      return
    }

    this.loggedErrors.add(message)
    console.warn(`[mailbox] ${message}`)
  }
}
