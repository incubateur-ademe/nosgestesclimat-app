import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import CountBadge from '@/design-system/layout/CountBadge'
import type { Locale } from '@/i18nConfig'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { Star } from 'lucide-react'
import FileSearchIcon from '../icons/FileSearchIcon'
import Trans from '../translation/trans/TransServer'
import { getActionsWithChoice } from './utils/getActionsWithChoice'

interface Props {
  actions: MaybePersonalizedAction[] | null
  locale: Locale
}

export default function ActionPlanLinks({ actions, locale }: Props) {
  const actionsWithChoice = getActionsWithChoice(actions ?? [])

  return (
    <div className="mb-8 flex gap-4">
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
        className="text-default border-slate-300"
        href="/actions/mon-plan">
        <Star className="stroke-default mr-2.5 w-4" />
        <Trans i18nKey="actions.plan.links.exploreActions" locale={locale}>
          Mon plan d'action
        </Trans>

        <CountBadge
          value={actionsWithChoice.length}
          className="ml-2.5 size-5 text-sm"
        />
      </ButtonLinkServer>
    </div>
  )
}
