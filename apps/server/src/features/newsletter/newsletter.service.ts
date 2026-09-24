import { createUserVerificationCode } from '@nosgestesclimat/core/features/auth/repositories/verification-codes.repository'
import { generateRandomVerificationCode } from '@nosgestesclimat/core/features/auth/services/create-verification-code.service'
import { verifyCode } from '@nosgestesclimat/core/features/auth/services/login.service'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import dayjs from 'dayjs'
import {
  addOrUpdateContact,
  fetchContact,
  removeFromNewsletters,
  sendNewsLetterConfirmationEmail,
} from '../../adapters/brevo/client.ts'
import { config } from '../../config.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import {
  REACHABLE_NEWSLETTER_LIST_IDS,
  type NewsletterConfirmationQuery,
  type NewsletterInscriptionDto,
  type ReachableNewsletterListId,
} from './newsletter.validator.ts'

export const updateNewslettersInscription = async ({
  email,
  listIds,
}: {
  email: string
  listIds: ReachableNewsletterListId
}) => {
  const contact = await fetchContact(email)
  const listToRemove = new Set(contact?.listIds ?? [])
    .intersection(new Set(REACHABLE_NEWSLETTER_LIST_IDS))
    .difference(new Set(listIds))

  await Promise.all([
    removeFromNewsletters({ email, listIds: Array.from(listToRemove) }),
    addOrUpdateContact({
      email,
      listIds,
      attributes: {},
    }),
  ])
}

export const confirmNewsletterSubscriptions = async ({
  query,
}: {
  query: NewsletterConfirmationQuery
}) => {
  const result = await verifyCode(query)

  if (!result.success) {
    throw new EntityNotFoundException('Verification code not found')
  }

  await updateNewslettersInscription(query)
}

export const sendNewsletterConfirmationEmail = async ({
  inscriptionDto: { email, listIds },
}: {
  inscriptionDto: NewsletterInscriptionDto
}) => {
  const code = generateRandomVerificationCode()

  await createUserVerificationCode(
    {
      email,
      code,
      expirationDate: dayjs().add(1, 'day').toDate(),
    },
    { session: prisma }
  )

  return sendNewsLetterConfirmationEmail({
    newsLetterConfirmationBaseUrl: config.app.serverUrl,
    origin: config.app.origin,
    listIds,
    email,
    code,
  })
}
