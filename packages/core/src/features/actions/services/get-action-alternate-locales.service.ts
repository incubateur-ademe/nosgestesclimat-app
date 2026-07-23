import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findVisibleActionAlternateLocalesBySlug } from '../repositories/actions.repository.ts'

export const getActionAlternateLocales = async (
  slug: string
): Promise<
  Partial<
    Record<ISOSupportedLanguage, { actionSlug: string; themeSlug: string }>
  >
> => await findVisibleActionAlternateLocalesBySlug(slug)
