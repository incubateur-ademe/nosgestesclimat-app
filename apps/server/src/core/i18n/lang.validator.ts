import * as v from 'valibot'
import { Locales } from './constant.ts'

export const LocaleValues = [Locales.en, Locales.fr] as const

export const LocaleQuery = v.strictObject({
  locale: v.optional(v.picklist(LocaleValues), Locales.fr),
})
