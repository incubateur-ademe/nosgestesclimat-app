import type { Result } from '../../lib/result.ts'
import type { TemplateId } from './email.constant.ts'
import type { EmailRequestError } from './errors.ts'

export type SendEmail = (params: {
  email: string
  templateId: TemplateId
  params: Record<string, unknown>
}) => Promise<Result<void, EmailRequestError>>

export type ContactAttributes = Record<string, unknown>

export type AddOrUpdateContact = (params: {
  email: string
  attributes: ContactAttributes
  listIds?: number[]
}) => Promise<Result<void, EmailRequestError>>
