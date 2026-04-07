'use client'

import Link from '@/components/Link'
import { endClickAction } from '@/constants/tracking/pages/end'
import { MON_ESPACE_ACTIONS_PATH } from '@/constants/urls/paths'
import ActionCard from '@/design-system/actions/ActionCard'
import {
  getBackgroundLightColor,
  getBorderColor,
} from '@/helpers/getCategoryColorClass'
import { useRule } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export default function RecommendedAction({
  actionDottedName,
}: {
  actionDottedName: DottedName
}) {
  const { icons, title, numericValue } = useRule(actionDottedName)

  return (
    <li>
      <ActionCard
        icons={icons || ''}
        title={title || ''}
        footprintAvoided={numericValue}
        tag={Link}
        href={`${MON_ESPACE_ACTIONS_PATH}/${actionDottedName}`}
        onClick={() =>
          trackMatomoEvent__deprecated(endClickAction(actionDottedName))
        }
        className={`border-2 ${getBorderColor(actionDottedName.split('.')[0])} ${getBackgroundLightColor(actionDottedName.split('.')[0])} transition-opacity hover:opacity-80`}
      />
    </li>
  )
}
