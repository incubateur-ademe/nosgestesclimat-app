'use client'

import PlusIcon from '@/components/icons/PlusIcon'
import CheckIcon from '@/components/icons/status/CheckIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { ActionChoiceType } from '@nosgestesclimat/core/prisma/generated/client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export default function CommitToActionButton({
  actionId,
  actionChoiceType,
  className,
  shortLabelDisplayed,
}: {
  actionId: string
  actionChoiceType?: ActionChoiceType
  className?: string
  shortLabelDisplayed?: boolean
}) {
  const { t } = useClientTranslation()
  const [isPending, startTransition] = useTransition()

  const handleCommitToAction = () => {
    startTransition(async () => {
      // const result = await commitToAction(actionId)

      // if (!result.success) {
      //   toast.error(
      //     t(
      //       'actions.commitToActionButton.error',
      //       "Une erreur s'est produite, veuillez réessayer."
      //     )
      //   )
      // }

      toast.success(
        t(
          'actions.commitToActionButton.success',
          'Action sélectionnée avec succès.'
        )
      )
    })
  }

  if (actionChoiceType === 'committed') {
    return (
      <Button
        color="secondary"
        onClick={() => {}}
        disabled
        className={twMerge('animate-scale text-sm!', className)}>
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
