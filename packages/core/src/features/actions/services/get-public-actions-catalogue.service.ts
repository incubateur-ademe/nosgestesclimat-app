import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findVisibleActions } from '../repositories/actions.repository.ts'
import type { Action } from '../types/action.ts'

// Curated highlight actions for the "highest impact" section, in this order.
const HIGHLIGHTED_ACTION_SLUGS: Record<ISOSupportedLanguage, string[]> = {
  fr: ['limiter-avion', 'petits-trajets-sans-voiture', 'limiter-viande'],
  en: ['reduce-flying', 'short-trips-without-car', 'reduce-meat'],
}

export const getPublicActionsCatalogue = async (
  locale: ISOSupportedLanguage
): Promise<{
  actions: Action[]
  topActions: Action[]
}> => {
  const actions = await findVisibleActions({
    locale,
    orderBy: { title: 'asc' },
  })

  return {
    actions,
    topActions: getHighlightedActions(actions, locale),
  }
}

const getHighlightedActions = (
  actions: Action[],
  locale: ISOSupportedLanguage
): Action[] => {
  const actionsBySlug = new Map(actions.map((action) => [action.slug, action]))

  return HIGHLIGHTED_ACTION_SLUGS[locale]
    .map((slug) => actionsBySlug.get(slug))
    .filter((action): action is Action => action !== undefined)
}
