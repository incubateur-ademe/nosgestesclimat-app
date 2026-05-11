import type { ISOSupportedLanguage } from '../../geo/types/language.ts'

export interface Theme {
  id: string
  title: string
  language: ISOSupportedLanguage
}
