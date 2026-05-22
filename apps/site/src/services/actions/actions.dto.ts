import type { Action } from '@/types/actions'
import type { Action as ActionEntity } from '@nosgestesclimat/core/features/actions/types/action'

export function toActionDto(action: ActionEntity): Action {
  const {
    id,
    title,
    slug,
    trackingId,
    language,
    longDescription,
    theme,
    ruleId,
    media,
    tips,
    financialIncentives,
    furtherExplore,
    metadata,
    publishedAt,
  } = action
  return {
    id,
    title,
    slug,
    trackingId,
    language,
    longDescription,
    theme,
    ruleId,
    media,
    tips,
    financialIncentives,
    furtherExplore,
    metadata,
    publishedAt,
  }
}
