import CommitToActionButton from '@/components/actions/highlightedActionCard/CommitToActionButton'
import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'

interface Props {
  action: MaybePersonalizedAction
  locale: Locale
}

export function ActionCommitmentBanner({ action, locale }: Props) {
  if (!action.assessment) return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-10 flex h-20 w-full items-center justify-center bg-white px-6 shadow-[0_-4px_14px_0_rgba(0,0,0,0.10)]">
      <CommitToActionButton
        buttonColor="primary"
        className="w-full sm:w-72"
        action={action}
        label={
          <Trans locale={locale} i18nKey="actions.plan.addToActionPlan">
            Ajouter à mon plan d'action
          </Trans>
        }
      />
    </div>
  )
}
