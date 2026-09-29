'use client'

import PlusIcon from '@/components/icons/PlusIcon'
import CheckIcon from '@/components/icons/status/CheckIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button, { type ButtonColor } from '@/design-system/buttons/Button'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'cn'
import { useCommitToAction } from './commitToActionButton/useCommitToAction'

interface Props {
  action: PersonalizedAction
  className?: string
  label?: React.ReactNode
  cacheTagToUpdate: string
  buttonColor?: Extract<ButtonColor, 'primary' | 'secondary'>
}

export default function CommitToActionButton({
  action,
  className,
  label,
  cacheTagToUpdate,
  buttonColor = 'secondary',
}: Props) {
  const { commitToAction, isPending, shouldDisplayAnimation } =
    useCommitToAction(action, cacheTagToUpdate)

  if (action.choice?.type === 'committed') {
    return (
      <Button
        // @TODO: implement variant prop and color prop
        color="borderless"
        // @TODO: implement the commitment canceling feature
        onClick={() => {}}
        disabled
        className={twMerge(
          'relative',
          'bg-green-50 text-sm! text-green-600 opacity-100! hover:bg-green-100 hover:text-green-700',
          'before:absolute before:inset-0 before:rounded-[inherit]',
          'before:bg-[linear-gradient(45deg,transparent_25%,rgba(0,166,62,0.2)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease]',
          shouldDisplayAnimation && 'before:animate-button-shine',
          className
        )}>
        <CheckIcon className="mr-2 inline-block size-5 fill-green-600 stroke-1" />
        <Trans i18nKey="actions.components.actionCard.highlighted.addedButton.short">
          Ajouté
        </Trans>
      </Button>
    )
  }

  return (
    <Button
      key={action.id}
      color={buttonColor}
      onClick={commitToAction}
      loading={isPending}
      className={twMerge('text-sm!', className)}>
      {!isPending && (
        <PlusIcon
          className={twMerge(
            'stroke-primary-700 mr-2 inline-block size-3',
            buttonColor === 'primary' && 'stroke-white'
          )}
        />
      )}
      {label ?? (
        <Trans i18nKey="actions.components.actionCard.highlighted.addButton.add">
          Ajouter
        </Trans>
      )}
    </Button>
  )
}
