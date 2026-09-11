import { BrevoMailbox } from './brevo-mailbox'
import { StubMailbox } from './stub-mailbox'
import type { MailboxAdapter } from './types'

export const createMailboxAdapter = (): MailboxAdapter =>
  process.env.E2E_MAILBOX === 'brevo' ? new BrevoMailbox() : new StubMailbox()
