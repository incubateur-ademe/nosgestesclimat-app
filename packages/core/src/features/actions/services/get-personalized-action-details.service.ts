import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findLastFinishedSimulationByUserId } from '../../simulation-computation/repositories/simulation-computations.repository.ts'
import {
  findAllVisiblePersonalizedActions,
  findVisiblePersonalizedActionBySlug,
} from '../repositories/actions.repository.ts'
import type { PersonalizedAction } from '../types/action.ts'

export interface PersonalizedActionDetails {
  action: PersonalizedAction
  /**
   * The other actions of the same theme, most impactful first.
   *
   * An action is only left aside when its assessment states it does not apply
   * to the user. Without personalization data (no simulation, assessments not
   * computed yet, or missing answers) applicability is unknown, not false, so
   * the action is kept.
   */
  otherThemeActions: PersonalizedAction[]
}

export const getPersonalizedActionDetails = async (
  slug: string,
  locale: ISOSupportedLanguage,
  userId: string | undefined
): Promise<PersonalizedActionDetails | null> => {
  const lastFinished = await findLastFinishedSimulationByUserId(
    userId
  )
  const action = await findVisiblePersonalizedActionBySlug(
    slug,
    locale,
    lastFinished?.simulationId
  )

  if (!action) return null

  const themeActions = await findAllVisiblePersonalizedActions(
    lastFinished?.simulationId,
    locale,
    {
      themeId: action.theme.id,
      fallbackToDefaultLocale: true,
    }
  )

  const otherThemeActions = themeActions
    .filter(({ id }) => id !== action.id)
    .filter(isNotRuledOut)
    .sort(byDescendingImpact)

  return { action, otherThemeActions }
}

/**
 * Only an assessment stating the action does not apply rules it out: an action
 * without an assessment has no personalization data to be judged on, and is
 * kept.
 */
const isNotRuledOut = ({ assessment }: PersonalizedAction) =>
  assessment?.applicable !== false

const getImpact = ({ assessment }: PersonalizedAction): number | undefined =>
  typeof assessment?.impact === 'number' ? assessment.impact : undefined

const byDescendingImpact = (a: PersonalizedAction, b: PersonalizedAction) => {
  const impactA = getImpact(a)
  const impactB = getImpact(b)

  if (impactA === impactB) return 0
  // Actions without a known impact sink to the bottom of the list
  if (impactA === undefined) return 1
  if (impactB === undefined) return -1

  return impactB - impactA
}
