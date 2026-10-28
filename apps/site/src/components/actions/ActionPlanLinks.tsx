import {
  ACTIONS_MY_PLAN_PATH,
  ACTIONS_SUGGESTED_PATH,
} from '@/constants/urls/paths'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import CountBadge from '@/design-system/layout/CountBadge'
import type { ActionPlan } from '@nosgestesclimat/core/features/actions/types/action'
import { cn } from 'cn'
import { Star } from 'lucide-react'
import FileWithMagnifierIcon from '../icons/FileWithMagnifierIcon'
import Trans from '../translation/trans/TransServer'

const ACTIVE_LINK_CLASSES = 'bg-primary-100 border-primary-300'
const INACTIVE_LINK_CLASSES = 'text-default border-slate-300'

interface Props {
  plan: ActionPlan
  activeLink?: 'explore' | 'plan'
  className?: string
}

export default function ActionPlanLinks({
  plan,
  className,
  activeLink = 'explore',
}: Props) {
  const isExploreActive = activeLink === 'explore'
  const isPlanActive = activeLink === 'plan'

  return (
    <div className={cn('flex gap-4 overflow-auto', className)}>
      <ButtonLinkServer
        variant="outlined"
        className={cn(
          'font-normal',
          isExploreActive ? ACTIVE_LINK_CLASSES : INACTIVE_LINK_CLASSES
        )}
        aria-current={isExploreActive ? 'page' : undefined}
        href={ACTIONS_SUGGESTED_PATH}>
        <FileWithMagnifierIcon
          className={cn(
            'mr-2.5',
            isExploreActive ? 'fill-primary-700' : 'fill-default'
          )}
        />
        <Trans i18nKey="actions.plan.links.exploreActions">
          Explorer les actions
        </Trans>
      </ButtonLinkServer>

      <ButtonLinkServer
        variant="outlined"
        className={cn(
          'relative pr-13! font-normal',
          isPlanActive ? ACTIVE_LINK_CLASSES : INACTIVE_LINK_CLASSES
        )}
        aria-current={isPlanActive ? 'page' : undefined}
        href={ACTIONS_MY_PLAN_PATH}>
        <Star
          className={cn(
            'mr-2.5 h-4',
            isPlanActive ? 'stroke-primary-700' : 'stroke-default'
          )}
        />
        <Trans i18nKey="actions.plan.links.myActionPlan">
          Mon plan d'action
        </Trans>

        <CountBadge
          value={plan.numberOfCommittedActions}
          className="absolute top-1/2 right-5 ml-2.5 size-5 -translate-y-1/2 text-sm"
        />
      </ButtonLinkServer>
    </div>
  )
}
