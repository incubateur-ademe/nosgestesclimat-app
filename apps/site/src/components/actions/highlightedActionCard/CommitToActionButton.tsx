'use client'

import PlusIcon from '@/components/icons/PlusIcon'
import CheckIcon from '@/components/icons/status/CheckIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'tailwind-merge'
import { useCommitToAction } from './commitToActionButton/useCommitToAction'

export default function CommitToActionButton({
  action,
  className,
  shortLabelDisplayed,
}: {
  action: PersonalizedAction
  className?: string
  shortLabelDisplayed?: boolean
}) {
  const { commitToAction, isPending, shouldDisplayAnimation } =
    useCommitToAction(action)

  if (action.choice?.type === 'committed') {
    return (
      <Button
        color="secondary"
        onClick={() => {}}
        // disabled
        className={twMerge(
          'relative',
          'text-sm! opacity-100! hover:bg-white',
          'before:absolute before:inset-0 before:rounded-[inherit]',
          'before:bg-[linear-gradient(45deg,transparent_25%,rgba(115,125,225,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease]',
          shouldDisplayAnimation && 'focus-within:before:animate-button-shine',
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
      onClick={commitToAction}
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
