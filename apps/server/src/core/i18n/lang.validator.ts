import { z } from 'zod'
import { Locales } from './constant.js'

export const LocaleQuery = z
  .object({
    locale: z.enum(Locales).default(Locales.fr),
  })
  .strict()
