import { createBrevoClient } from '@nosgestesclimat/core/features/emails/brevo/client'

const emailClient = createBrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
  url: process.env.BREVO_URL!,
})

export const sendEmail = emailClient.sendEmail
export const addOrUpdateContact = emailClient.addOrUpdateContact
