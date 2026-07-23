import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findVisibleActions } from '../repositories/actions.repository.ts'
import type { Action } from '../types/action.ts'

// Curated highlight actions for the "highest impact" section, in this order.
// Locale lists must stay index-aligned: they describe the same actions.
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
  const actions = await findVisibleActions(locale, {
    orderBy: { title: 'asc' },
    fallbackToDefaultLocale: true,
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
    .map(
      (slug, index) =>
        actionsBySlug.get(slug) ??
        // Actions falling back to french content keep their french slug
        actionsBySlug.get(HIGHLIGHTED_ACTION_SLUGS.fr[index])
    )
    .filter((action): action is Action => action !== undefined)
}
