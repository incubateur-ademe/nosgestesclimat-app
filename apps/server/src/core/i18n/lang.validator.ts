import { z } from 'zod'
import { Locales } from './constant.ts'

export const LocaleQuery = z
  .object({
    locale: z.enum(Locales).default(Locales.fr),
  })
  .strict()
