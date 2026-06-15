import { AgeRangeSchema } from '@nosgestesclimat/core/features/users/types/age-range'
import * as v from 'valibot'

import { ListIds } from '../../adapters/brevo/constant.ts'
import { LocaleQuery } from '../../core/i18n/lang.validator.ts'

export const UserParams = v.strictObject({
  userId: v.pipe(v.string(), v.uuid()),
})

export type UserParams = v.InferOutput<typeof UserParams>

export const FetchUserContactValidator = {
  body: v.optional(v.strictObject({})),
  params: v.strictObject({}),
  query: LocaleQuery,
}

export const FetchMeValidator = {
  body: v.optional(v.strictObject({})),
  params: v.strictObject({}),
  query: v.strictObject({}),
}

const UserUpdateDto = v.partial(
  v.strictObject({
    email: v.pipe(
      v.string(),
      v.email(),
      v.transform((email: string) => email.toLocaleLowerCase())
    ),
    name: v.string(),
    ageRange: AgeRangeSchema,
    contact: v.strictObject({
      listIds: v.array(v.enum(ListIds)),
    }),
  })
)

export type UserUpdateDto = v.InferOutput<typeof UserUpdateDto>

const UserUpdateQuery = v.strictObject({
  ...LocaleQuery.entries,
  code: v.optional(v.pipe(v.string(), v.regex(/^\d{6}$/))),
})

export const UpdateUserValidator = {
  body: UserUpdateDto,
  params: UserParams,
  query: UserUpdateQuery,
}
