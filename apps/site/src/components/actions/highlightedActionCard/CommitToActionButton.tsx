'use client'

import PlusIcon from '@/components/icons/PlusIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { commitToAction } from '@/services/actions/commit-to-action' // Server Action
import { useTransition } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export default function CommitToActionButton({
  actionId,
  className,
  shortLabelDisplayed,
}: {
  actionId: string
  className?: string
  shortLabelDisplayed?: boolean
}) {
  const { t } = useClientTranslation()
  const [isPending, startTransition] = useTransition()

  const handleCommitToAction = () => {
    startTransition(async () => {
      const result = await commitToAction(actionId)

      if (!result?.success) {
        toast.error(
          t(
            'actions.commitToActionButton.error',
            "Une erreur s'est produite, veuillez réessayer."
          )
        )
      }

      toast.success(
        t(
          'actions.commitToActionButton.success',
          'Action sélectionnée avec succès.'
        )
      )
    })
  }

  return (
    <Button
      color="secondary"
      onClick={handleCommitToAction}
      disabled={isPending}
      className={twMerge('text-sm!', className)}>
      <PlusIcon className="stroke-primary-700 mr-2 inline-block size-3" />
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
