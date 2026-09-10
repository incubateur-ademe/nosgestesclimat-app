import { env } from '@/env.server'
import { createBrevoClient } from '@nosgestesclimat/core/features/emails/brevo/client'

const emailClient = createBrevoClient({
  apiKey: env.BREVO_API_KEY,
  url: env.BREVO_URL,
})

export const sendEmail = emailClient.sendEmail
export const addOrUpdateContact = emailClient.addOrUpdateContact
