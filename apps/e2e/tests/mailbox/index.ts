import { MailiskMailbox } from './mailisk-mailbox'
import { StubMailbox } from './stub-mailbox'
import type { MailboxAdapter } from './types'

export const createMailboxAdapter = (): MailboxAdapter =>
  process.env.E2E_MAILBOX_MAILISK_NAMESPACE
    ? new MailiskMailbox()
    : new StubMailbox()
