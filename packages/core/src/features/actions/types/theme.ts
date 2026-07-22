import type { ISOSupportedLanguage } from '../../geo/types/language.ts'

export type ThemeKey =
  | 'food'
  | 'transport'
  | 'societal_services'
  | 'housing'
  | 'misc'

export interface Theme {
  id: string
  key: ThemeKey
  slug: string
  /** Human readable id for tracking purposes */
  trackingId: string
  title: string
  locale: ISOSupportedLanguage
  emoji: string
}

/** Persisted theme row, carrying every locale's title/slug as their own columns */
export interface ThemeRow {
  id: string
  key: ThemeKey
  slug: string
  slugEn: string
  trackingId: string
  title: string
  titleEn: string
  emoji: string
}
