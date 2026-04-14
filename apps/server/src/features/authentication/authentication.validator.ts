import { z } from 'zod'
import { LocaleQuery } from '../../core/i18n/lang.validator.js'

export const LoginDto = z
  .object({
    userId: z.uuid(),
    email: z.email().transform((email) => email.toLocaleLowerCase()),
    code: z.string().regex(/^\d{6}$/),
  })
  .strict()

export type LoginDto = z.infer<typeof LoginDto>

export const LoginValidator = {
  body: LoginDto,
  params: z.object({}).strict().optional(),
  query: LocaleQuery,
}
