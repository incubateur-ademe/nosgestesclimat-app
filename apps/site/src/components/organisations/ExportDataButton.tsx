'use client'

import type { ButtonProps } from '@/design-system/buttons/Button'
import Button from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import { fetchPollResults } from '@/services/organisations/fetchPollResults'
import type { PublicOrganisationPoll } from '@/types/organisations'
import { captureException } from '@sentry/nextjs'
import { useTransition } from 'react'
import DownloadIcon from '../icons/DownloadIcon'
import Trans from '../translation/trans/TransClient'

interface Props {
  poll: PublicOrganisationPoll
  color?: 'primary' | 'secondary' | 'borderless'
  onClick?: () => void
}

export default function ExportDataButton({
  color = 'secondary',
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
        const data = await fetchPollResults(props)

        window.open(data.url, '_blank')
      } catch (error) {
        captureException(error)
      }
    })
  }

  return (
    <div className="relative pb-11" aria-live="polite">
      <Button
        className={className}
        color={color}
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
