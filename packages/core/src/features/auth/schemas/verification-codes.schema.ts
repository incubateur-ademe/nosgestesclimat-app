import * as v from 'valibot'

import { ISOSupportedLanguageSchema } from '../../geo/types/language.ts'

/**
 * Locale contract shared by the auth actions, inherited from the old HTTP
 * query validator: a missing locale defaults to 'fr', an unsupported one
 * fails validation and is rejected by the caller.
 */
const locale = v.optional(ISOSupportedLanguageSchema, 'fr')

export const LoginPayloadSchema = v.strictObject({
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
  code: v.pipe(v.string(), v.regex(/^\d{6}$/)),
  locale,
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
