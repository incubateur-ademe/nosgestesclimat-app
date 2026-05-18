import { z } from 'zod'
import { ListIds } from '../../adapters/brevo/constant.ts'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'

export const UserParams = z
  .object({
    userId: z.uuid(),
  })
  .strict()

export type UserParams = z.infer<typeof UserParams>

export const FetchUserContactValidator = {
  body: z.object({}).strict().optional(),
  params: z.object({}).strict(),
  query: LocaleQuery,
}

export const FetchMeValidator = {
  body: z.object({}).strict().optional(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
}

const AgeRange = z.enum([
  'under_18',
  '18-24',
  '25-34',
  '35-49',
  '50-64',
  'over_65',
  'refused',
])

export type AgeRange = z.infer<typeof AgeRange>

const UserUpdateDto = z
  .object({
    email: z.email().transform((email) => email.toLocaleLowerCase()),
    name: z.string(),
    ageRange: AgeRange,
    contact: z
      .object({
        listIds: z.array(z.enum(ListIds)),
      })
      .strict(),
  })
  .strict()
  .partial()

export type UserUpdateDto = z.infer<typeof UserUpdateDto>

const UserUpdateQuery = z
  .object({
    code: z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
  })
  .extend(LocaleQuery.shape)
  .strict()

export const UpdateUserValidator = {
  body: UserUpdateDto,
  params: UserParams,
  query: UserUpdateQuery,
}
