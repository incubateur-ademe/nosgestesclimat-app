import type { ISOSupportedLanguage } from '../../geo/types/language.ts'

type ThemeKey = 'food' | 'transport' | 'societal_services' | 'housing' | 'misc'

export interface Theme {
  id: string
  key: ThemeKey
  /** Human readable id for tracking purposes */
  trackingId: string
  title: string
  language: ISOSupportedLanguage
  emoji: string
}
