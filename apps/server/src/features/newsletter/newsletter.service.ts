import dayjs from 'dayjs'
import {
  addOrUpdateContact,
  fetchContact,
  removeFromNewsletters,
  sendNewsLetterConfirmationEmail,
} from '../../adapters/brevo/client.js'
import { config } from '../../config.js'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.js'
import { isPrismaErrorNotFound } from '../../core/typeguards/isPrismaError.js'
import { verifyCode } from '../authentication/authentication.service.js'
import { generateVerificationCode } from '../authentication/verification-codes.service.js'
import {
  REACHABLE_NEWSLETTER_LIST_IDS,
  type NewsletterConfirmationQuery,
  type NewsletterInscriptionDto,
  type ReachableNewsletterListId,
} from './newsletter.validator.js'

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
  try {
    await verifyCode(query)
    await updateNewslettersInscription(query)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Verification code not found')
    }
    throw e
  }
}

export const sendNewsletterConfirmationEmail = async ({
  inscriptionDto: { email, listIds },
  origin,
}: {
  inscriptionDto: NewsletterInscriptionDto
  origin: string
}) => {
  const { code } = await generateVerificationCode({
    verificationCodeDto: { email },
    expirationDate: dayjs().add(1, 'day').toDate(),
  })

  return sendNewsLetterConfirmationEmail({
    newsLetterConfirmationBaseUrl: config.app.serverUrl,
    listIds,
    origin,
    email,
    code,
  })
}
