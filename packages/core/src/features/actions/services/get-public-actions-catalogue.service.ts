import { findVisibleActions } from '../repositories/actions.repository.ts'
import type { Action } from '../types/action.ts'

// Curated highlight actions for the "highest impact" section, in this order
const HIGHLIGHTED_ACTION_SLUGS = [
  'limiter-avion',
  'petits-trajets-sans-voiture',
  'limiter-viande',
]

export const getPublicActionsCatalogue = async (): Promise<{
  actions: Action[]
  topActions: Action[]
}> => {
  const actions = await findVisibleActions({ orderBy: { title: 'asc' } })

  return {
    actions,
    topActions: getHighlightedActions(actions),
  }
}

const getHighlightedActions = (actions: Action[]): Action[] => {
  const actionsBySlug = new Map(actions.map((action) => [action.slug, action]))

  return HIGHLIGHTED_ACTION_SLUGS.map((slug) => actionsBySlug.get(slug)).filter(
    (action): action is Action => action !== undefined
  )
}
