import type { ISOSupportedLanguage } from '../../geo/types/language.js'

export interface Theme {
  id: string
  title: string
  language: ISOSupportedLanguage
}
