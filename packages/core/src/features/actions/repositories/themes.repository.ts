import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { themes } from '../data/themes/index.ts'
import type { Theme } from '../types/theme.ts'

// kept async to match the repository's other Promise-returning functions
export const findThemes = async (
  locale: ISOSupportedLanguage = 'fr'
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<Theme[]> => {
  return themes.map(({ titleEn, slugEn, ...theme }) => ({
    ...theme,
    title: locale === 'en' ? titleEn : theme.title,
    slug: locale === 'en' ? slugEn : theme.slug,
    locale,
  }))
}
