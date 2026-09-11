// In-memory store of transactional emails captured from the Brevo mock.

interface StoredEmail {
  to?: string
  templateId?: number
  params?: Record<string, unknown>
  receivedAt: string
}

const emails: StoredEmail[] = []

export const storeEmail = ({
  to,
  templateId,
  params,
}: {
  to?: string
  templateId?: number
  params?: Record<string, unknown>
}) => {
  emails.push({
    to,
    templateId,
    params,
    receivedAt: new Date().toISOString(),
  })
}

export const findEmails = ({
  to,
  templateId,
}: {
  to?: string | null
  templateId?: string | null
}) =>
  emails
    .filter((email) => !to || email.to === to)
    .filter((email) => !templateId || String(email.templateId) === templateId)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))

export const clearEmails = () => {
  emails.length = 0
}
