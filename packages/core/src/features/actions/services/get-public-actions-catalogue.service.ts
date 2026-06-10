import { findAllVisiblePersonalizedActions } from '../repositories/actions.repository.ts'
import type { PersonalizedAction } from '../types/action.ts'

// Curated highlight actions for the "highest impact" section, in this order,
// regardless of the user's personalized assessment
const HIGHLIGHTED_ACTION_SLUGS = [
  'limiter-avion',
  'petits-trajets-sans-voiture',
  'limiter-viande',
]

export const getPublicActionsCatalogue = async (
  userId: string
): Promise<{
  actions: PersonalizedAction[]
  topActions: PersonalizedAction[]
}> => {
  const personalizedActions = await findAllVisiblePersonalizedActions(userId)

  // Show all visible actions regardless of assessment/applicability, sorted
  // by quantifiable impact desc (non-quantifiable, inapplicable and
  // unassessed actions last, in their original relative order)
  const actions = [...personalizedActions].sort(
    (a, b) =>
      (b.assessment?.impact ?? -Infinity) - (a.assessment?.impact ?? -Infinity)
  )

  // Actions with a quantifiable impact take precedence over the curated
  // highlighted actions, since they are personalized to the user
  const impactBasedTopActions = actions
    .filter((action) => typeof action.assessment?.impact === 'number')
    .slice(0, 3)

  return {
    actions,
    topActions:
      impactBasedTopActions.length > 0
        ? impactBasedTopActions
        : getHighlightedActions(actions),
  }
}

const getHighlightedActions = (
  actions: PersonalizedAction[]
): PersonalizedAction[] => {
  const actionsBySlug = new Map(actions.map((action) => [action.slug, action]))

  return HIGHLIGHTED_ACTION_SLUGS.map((slug) => actionsBySlug.get(slug)).filter(
    (action): action is PersonalizedAction => action !== undefined
  )
}
