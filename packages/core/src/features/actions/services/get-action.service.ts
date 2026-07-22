import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findVisibleActionBySlug } from '../repositories/actions.repository.ts'
import type { Action } from '../types/action.ts'

export const getAction = async (
  slug: string,
  locale: ISOSupportedLanguage
): Promise<Action | null> => findVisibleActionBySlug(slug, locale)
