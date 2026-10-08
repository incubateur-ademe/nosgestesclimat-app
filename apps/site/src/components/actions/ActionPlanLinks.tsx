import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import CountBadge from '@/design-system/layout/CountBadge'
import type { Locale } from '@/i18nConfig'
import type { ActionPlan } from '@nosgestesclimat/core/features/actions/types/action'
import { Star } from 'lucide-react'
import FileSearchIcon from '../icons/FileSearchIcon'
import Trans from '../translation/trans/TransServer'

interface Props {
  plan: ActionPlan
  locale: Locale
}

export default function ActionPlanLinks({ plan, locale }: Props) {
  return (
    <div className="mb-8 flex gap-4 overflow-auto">
      <ButtonLinkServer
        color="secondary"
        className="bg-primary-100 border-primary-300"
        href="/fin/actions">
        <FileSearchIcon className="fill-primary-700 mr-2.5" />
        <Trans i18nKey="actions.plan.links.exploreActions" locale={locale}>
          Explorer les actions
        </Trans>
      </ButtonLinkServer>

      <ButtonLinkServer
        color="secondary"
        className="text-default relative border-slate-300 pr-13!"
        href="/actions/mon-plan">
        <Star className="stroke-default mr-2.5 h-4" />
        <Trans i18nKey="actions.plan.links.myActionPlan" locale={locale}>
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
