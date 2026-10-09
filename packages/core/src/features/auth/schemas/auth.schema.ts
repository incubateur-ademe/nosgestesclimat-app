import * as v from 'valibot'

import { ISOSupportedLanguageSchema } from '../../geo/types/language.ts'

/**
 * Locale contract shared by the auth actions, inherited from the old HTTP
 * query validator: a missing locale defaults to 'fr', an unsupported one
 * fails validation and is rejected by the caller.
 */
const locale = v.optional(ISOSupportedLanguageSchema, 'fr')

/**
 * Why the user logs in. Each login entry point on the site passes its own
 * intent: the login service uses it to decide which post-login email, if
 * any, to send - the simulation completed email only belongs to the
 * save-simulation intent.
 */
export const LoginIntents = [
  'save-simulation',
  'participate-to-poll',
  'create-group',
  'create-organisation',
  'create-account',
] as const

export type Intent = (typeof LoginIntents)[number]

const intent = v.picklist(LoginIntents)

export const LoginPayloadSchema = v.strictObject({
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
  code: v.pipe(v.string(), v.regex(/^\d{6}$/)),
  locale,
  intent,
})

export type LoginPayload = v.InferOutput<typeof LoginPayloadSchema>

export const CreateVerificationCodePayloadSchema = v.strictObject({
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
  locale,
})

export type CreateVerificationCodePayload = v.InferOutput<
  typeof CreateVerificationCodePayloadSchema
>
