import * as v from 'valibot'

export const LoginDto = v.strictObject({
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email: string) => email.toLocaleLowerCase())
  ),
  code: v.pipe(v.string(), v.regex(/^\d{6}$/)),
})

export type LoginDto = v.InferOutput<typeof LoginDto>

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
