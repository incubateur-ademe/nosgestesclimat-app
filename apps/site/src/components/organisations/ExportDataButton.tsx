'use client'

import type { ButtonProps } from '@/design-system/buttons/Button'
import Button from '@/design-system/buttons/Button'
import type { ButtonVariant } from '@/design-system/buttons/buttonStyles'
import Loader from '@/design-system/layout/Loader'
import logger from '@/logger/logger.browser'
import { downloadPollResults } from '@/services/organisations/download-poll-results'
import type { PollIdentifier } from '@/types/organisations'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { useTransition } from 'react'
import DownloadIcon from '../icons/DownloadIcon'
import Trans from '../translation/trans/TransClient'

interface Props {
  poll: PollIdentifier
  variant?: ButtonVariant
  onClick?: () => void
}

export default function ExportDataButton({
  variant = 'outlined',
  onClick,
  className,
  ...props
}: ButtonProps & Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      if (onClick) {
        onClick()
      }

      try {
        const data = await downloadPollResults(props)

        window.open(data.url, '_blank')
      } catch (error) {
        logger.error(toError(error), { scope: 'site.interaction.exportData' })
      }
    })
  }

  return (
    <div className="relative pb-11" aria-live="polite">
      <Button
        className={className}
        variant={variant}
        disabled={isPending}
        onClick={handleClick}
        size="sm"
        {...props}>
        <DownloadIcon className="fill-primary-800 mr-2 w-6 leading-none" />
        <Trans>Exporter les données</Trans>
      </Button>

      {isPending && (
        <p className="absolute bottom-0 left-0 mb-2 w-full text-center text-sm">
          <Loader size="sm" color="dark" className="mr-2" />
          <Trans>Chargement en cours...</Trans>
        </p>
      )}
    </div>
  )
}
