import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findThemes } from '../repositories/themes.repository.ts'
import type { Theme } from '../types/theme.ts'

export const getThemes = async (
  locale: ISOSupportedLanguage
): Promise<Theme[]> => findThemes(locale)
