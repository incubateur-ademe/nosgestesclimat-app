import type { ValueOf } from '../../types/types.ts'

export const Locales = {
  en: 'en',
  fr: 'fr',
} as const

export type Locales = ValueOf<typeof Locales>
