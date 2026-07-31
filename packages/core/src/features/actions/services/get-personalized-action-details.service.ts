import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findVisiblePersonalizedActionBySlug } from '../repositories/actions.repository.ts'
import type { PersonalizedAction } from '../types/action.ts'

export const getPersonalizedActionDetails = async (
  slug: string,
  locale: ISOSupportedLanguage,
  userId: string | undefined
): Promise<PersonalizedAction | null> =>
  findVisiblePersonalizedActionBySlug(slug, locale, userId)
