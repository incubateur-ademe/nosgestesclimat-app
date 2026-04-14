import { z } from 'zod'
import { VerificationCodeMode } from '../../adapters/prisma/generated.js'
import { LocaleQuery } from '../../core/i18n/lang.validator.js'

export const VerificationCodeCreateDto = z
  .object({
    email: z.email().transform((email) => email.toLocaleLowerCase()),
  })
  .strict()

export type VerificationCodeCreateDto = z.infer<
  typeof VerificationCodeCreateDto
>

export const VerificationCodeCreateQuery = LocaleQuery.extend({
  mode: z.enum(VerificationCodeMode).optional(),
})

export type VerificationCodeCreateQuery = z.infer<
  typeof VerificationCodeCreateQuery
>

export const VerificationCodeCreateValidator = {
  body: VerificationCodeCreateDto,
  params: z.object({}).strict().optional(),
  query: VerificationCodeCreateQuery,
}
