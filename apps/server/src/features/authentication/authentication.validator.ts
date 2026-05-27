import * as v from 'valibot'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'

export const LoginDto = v.strictObject({
  userId: v.pipe(v.string(), v.uuid()),
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
  code: v.pipe(v.string(), v.regex(/^\d{6}$/)),
})

export type LoginDto = v.InferOutput<typeof LoginDto>

export const LoginValidator = {
  body: LoginDto,
  params: v.optional(v.strictObject({})),
  query: LocaleQuery,
}
