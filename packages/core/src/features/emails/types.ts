import type { Result } from '../../lib/result.ts'
import type { ListIds, TemplateId } from './email.constant.ts'
import type { EmailRequestError } from './errors.ts'

/** A fully resolved email request */
export type Email = {
  email: string
  templateId: TemplateId
  params: Record<string, unknown>
}

export type SendEmail = (
  email: Email
) => Promise<Result<void, EmailRequestError>>

export type ContactAttributes = Record<string, unknown>

export type AddOrUpdateContact = (params: {
  email: string
  attributes: ContactAttributes
  listIds?: ListIds[]
}) => Promise<Result<void, EmailRequestError>>

/** Erases every attribute a contact holds except its address, and unlinks it
 * from every non-newsletter list. */
export type EraseContact = (params: {
  email: string
}) => Promise<Result<void, EmailRequestError>>
