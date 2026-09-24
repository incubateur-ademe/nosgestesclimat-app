'use client'

import PlusIcon from '@/components/icons/PlusIcon'
import CheckIcon from '@/components/icons/status/CheckIcon'
import Trans from '@/components/translation/trans/TransClient'
import { captureActionAddedToPlan } from '@/constants/tracking/trackers'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { commitToAction } from '@/services/actions/commit-to-action' // Server Action
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export default function CommitToActionButton({
  action,
  className,
  shortLabelDisplayed,
}: {
  action: PersonalizedAction
  className?: string
  shortLabelDisplayed?: boolean
}) {
  const { t } = useClientTranslation()
  const [isPending, startTransition] = useTransition()

  const handleCommitToAction = () => {
    startTransition(async () => {
      const result = await commitToAction(action.id)

      if (!result.success) {
        toast.error(
          t(
            'actions.commitToActionButton.error',
            "Une erreur s'est produite, veuillez réessayer."
          )
        )
      }

      captureActionAddedToPlan({
        actionTitle: action.title,
        actionTheme: action.theme,
        impactInKg: action.assessment?.impact,
      })

      toast.success(
        t(
          'actions.commitToActionButton.success',
          'Action sélectionnée avec succès.'
        )
      )
    })
  }

  if (action.choice?.type === 'committed') {
    return (
      <Button
        color="secondary"
        onClick={() => {}}
        disabled
        className={twMerge(
          'focus-within:animate-mini-zoom-in-out-fast text-sm!',
          className
        )}>
        <CheckIcon className="stroke-primary-700 mr-2 inline-block size-3" />
        <Trans i18nKey="actions.components.actionCard.highlighted.addedButton.short">
          Ajouté
        </Trans>
      </Button>
    )
  }

  return (
    <Button
      color="secondary"
      onClick={handleCommitToAction}
      loading={isPending}
      className={twMerge('text-sm!', className)}>
      {!isPending && (
        <PlusIcon className="stroke-primary-700 mr-2 inline-block size-3" />
      )}
      {shortLabelDisplayed ? (
        <Trans i18nKey="actions.components.actionCard.highlighted.addButton.short">
          Ajouter
        </Trans>
      ) : (
        <Trans i18nKey="actions.components.actionCard.highlighted.addButton.full">
          Ajouter à mon plan
        </Trans>
      )}
    </Button>
  )
}
