'use client'

import PlusIcon from '@/components/icons/PlusIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { commitToAction } from '@/services/actions/commit-to-action' // Server Action
import { useTransition } from 'react'

export default function CommitToActionButton({
  actionId,
}: {
  actionId: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleCommitToAction = () => {
    startTransition(async () => {
      const result = await commitToAction(actionId)
      if (!result?.success) {
        // afficher un toast d'erreur
      }
    })
  }

  return (
    <Button
      color="secondary"
      onClick={handleCommitToAction}
      disabled={isPending}>
      <Trans i18nKey="actions.components.actionCard.highlighted.addButton">
        <PlusIcon className="stroke-primary-700 mr-2 inline-block" /> Ajouter
      </Trans>
    </Button>
  )
}
