import * as v from 'valibot'
import { VerificationCodeMode } from '../../adapters/prisma/generated.ts'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'

export const VerificationCodeCreateDto = v.strictObject({
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
})

export type VerificationCodeCreateDto = v.InferOutput<
  typeof VerificationCodeCreateDto
>

export const VerificationCodeCreateQuery = v.strictObject({
  ...LocaleQuery.entries,
  mode: v.optional(v.enum(VerificationCodeMode)),
})

export type VerificationCodeCreateQuery = v.InferOutput<
  typeof VerificationCodeCreateQuery
>

export const VerificationCodeCreateValidator = {
  body: VerificationCodeCreateDto,
  params: v.optional(v.strictObject({})),
  query: VerificationCodeCreateQuery,
}
