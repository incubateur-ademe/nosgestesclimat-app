import type { TemplateId } from './email.constant.ts'

export type SendEmail = (params: {
  email: string
  templateId: TemplateId
  params: Record<string, unknown>
}) => Promise<void>

export type ContactAttributes = Record<string, unknown>

export type AddOrUpdateContact = (params: {
  email: string
  attributes: ContactAttributes
  listIds?: number[]
}) => Promise<void>
