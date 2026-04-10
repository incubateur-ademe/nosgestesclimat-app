import { z } from 'zod'
import { LocaleQuery } from '../../core/i18n/lang.validator.js'
import { ListIds } from '../../adapters/brevo/constant.js'

export const REACHABLE_NEWSLETTER_LIST_IDS = [
  ListIds.MAIN_NEWSLETTER,
  ListIds.TRANSPORT_NEWSLETTER,
  ListIds.LOGEMENT_NEWSLETTER,
  ListIds.ALIMENTATION_NEWSLETTER,
] as const

const ReachableNewsletterListId = z.preprocess(
  (val) => (Array.isArray(val) ? val : [val]),
  z.array(
    z.coerce
      .number()
      .pipe(z.union(REACHABLE_NEWSLETTER_LIST_IDS.map((id) => z.literal(id))))
  )
)
export type ReachableNewsletterListId = z.infer<
  typeof ReachableNewsletterListId
>
export const NewsletterInscriptionDto = z.object({
  email: z.email().transform((email) => email.toLocaleLowerCase()),
  listIds: ReachableNewsletterListId,
})

export const NewsletterInscriptionValidator = {
  body: NewsletterInscriptionDto,
  query: LocaleQuery,
  params: z.object({}),
}

export type NewsletterInscriptionDto = z.infer<typeof NewsletterInscriptionDto>

const NewsletterConfirmationQuery = z
  .object({
    code: z.string().regex(/^\d{6}$/),
    origin: z.string().refine((url) => {
      try {
        return new URL(url).origin === url
      } catch {
        return false
      }
    }),
    email: z.email().transform((email) => email.toLocaleLowerCase()),
    listIds: ReachableNewsletterListId,
  })
  .extend(LocaleQuery.shape)
  .strict()

export type NewsletterConfirmationQuery = z.infer<
  typeof NewsletterConfirmationQuery
>

export const NewsletterConfirmationValidator = {
  body: z.object({}).optional(),
  query: NewsletterConfirmationQuery,
  params: z.object({}),
}
