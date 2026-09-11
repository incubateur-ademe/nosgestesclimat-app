export interface EmailRecord {
  subject?: string
  params?: Record<string, unknown>
}

export interface MailboxAdapter {
  /** Last email sent to `email` using `templateId`. */
  lookup(email: string, templateId: number): Promise<EmailRecord | undefined>
}
