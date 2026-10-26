'use client'

import PlusIcon from '@/components/icons/PlusIcon'
import CheckIcon from '@/components/icons/status/CheckIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import type { ButtonVariant } from '@/design-system/buttons/buttonStyles'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design-system/shadcn/tooltip'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { cn } from 'cn'
import { useActionCommitment } from './commitToActionButton/useActionCommitment'

interface Props {
  action: PersonalizedAction
  className?: string
  buttonVariant?: Extract<ButtonVariant, 'filled' | 'outlined'>
}

export default function CommitToActionButton({
  action,
  className,
  buttonVariant = 'outlined',
}: Props) {
  const { t } = useClientTranslation()

  const {
    commitToAction,
    abandonActionCommitment,
    isPending,
    shouldDisplayAnimation,
  } = useActionCommitment(action)

  if (action.choice?.type === 'committed') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="text"
            onClick={abandonActionCommitment}
            disabled={isPending}
            className={cn(
              'relative w-auto md:w-52.5',
              'bg-green-50 text-sm! text-green-600 opacity-100! hover:bg-green-100 hover:text-green-700',
              'before:absolute before:inset-0 before:rounded-[inherit]',
              'before:bg-[linear-gradient(45deg,transparent_25%,rgba(0,166,62,0.2)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease]',
              shouldDisplayAnimation && 'before:animate-button-shine',
              className
            )}
            aria-label={t(
              'actions.components.actionCard.highlighted.addedButton.ariaLabel',
              "Ajouté, cliquer à nouveau pour retirer l'action de votre plan"
            )}>
            <CheckIcon className="mr-2 inline-block size-5 fill-green-600 stroke-1" />
            <Trans i18nKey="actions.components.actionCard.highlighted.addedButton.label">
              Ajouté
            </Trans>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-marianne">
          <Trans i18nKey="actions.components.actionCard.highlighted.addedButton.tooltip">
            Retirer de votre plan
          </Trans>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      variant={buttonVariant}
      onClick={commitToAction}
      loading={isPending}
      className={cn('w-auto px-7 text-sm! md:w-52.5', className)}>
      {!isPending && (
        <PlusIcon
          className={cn(
            'stroke-primary-700 mr-2 inline-block size-3',
            buttonVariant === 'filled' && 'stroke-white'
          )}
        />
      )}
      <span className="inline md:hidden">
        <Trans i18nKey="actions.components.actionCard.highlighted.addButton.add.short">
          Ajouter
        </Trans>
      </span>
      <span className="hidden md:inline">
        <Trans i18nKey="actions.components.actionCard.highlighted.addButton.add.long">
          Ajouter à mon plan
        </Trans>
      </span>
    </Button>
  )
}
