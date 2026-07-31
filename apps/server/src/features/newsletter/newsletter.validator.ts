import * as v from 'valibot'
import { ListIds } from '../../adapters/brevo/constant.ts'
import { allowedRedirectUrls, config } from '../../config.ts'
import { isSafeRedirectUrl } from '../../core/allowed-urls.ts'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'

export const REACHABLE_NEWSLETTER_LIST_IDS = [
  ListIds.MAIN_NEWSLETTER,
  ListIds.TRANSPORT_NEWSLETTER,
  ListIds.LOGEMENT_NEWSLETTER,
  ListIds.ALIMENTATION_NEWSLETTER,
] as const

const ReachableNewsletterListId = v.pipe(
  v.unknown(),
  v.transform((val: unknown) => (Array.isArray(val) ? val : [val])),
  v.array(
    v.pipe(
      v.unknown(),
      v.transform(Number),
      v.picklist(REACHABLE_NEWSLETTER_LIST_IDS)
    )
  )
)

export type ReachableNewsletterListId = v.InferOutput<
  typeof ReachableNewsletterListId
>

export const NewsletterInscriptionDto = v.strictObject({
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
  listIds: ReachableNewsletterListId,
})

export const NewsletterInscriptionValidator = {
  body: NewsletterInscriptionDto,
  query: LocaleQuery,
  params: v.strictObject({}),
}

export type NewsletterInscriptionDto = v.InferOutput<
  typeof NewsletterInscriptionDto
>

const NewsletterConfirmationQuery = v.strictObject({
  ...LocaleQuery.entries,
  code: v.pipe(v.string(), v.regex(/^\d{6}$/)),
  origin: v.fallback(
    v.pipe(
      v.string(),
      v.check((url: string) => isSafeRedirectUrl(url, allowedRedirectUrls))
    ),
    config.app.origin
  ),
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
  listIds: v.optional(ReachableNewsletterListId, []),
})

export type NewsletterConfirmationQuery = v.InferOutput<
  typeof NewsletterConfirmationQuery
>

export const NewsletterConfirmationValidator = {
  body: v.optional(v.strictObject({})),
  query: NewsletterConfirmationQuery,
  params: v.strictObject({}),
}
