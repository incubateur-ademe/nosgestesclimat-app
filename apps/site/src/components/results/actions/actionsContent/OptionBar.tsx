'use client'

import CloseIcon from '@/components/icons/Close'
import Trans from '@/components/translation/trans/TransClient'
import { trackingActionClickSortingButton } from '@/constants/tracking/actions'
import { captureActionClickSortingButton } from '@/constants/tracking/posthogTrackers'
import Button from '@/design-system/buttons/Button'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Action } from '@/publicodes-state/types'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { useState } from 'react'
import ActionsChosenIndicator from './ActionsChosenIndicator'

interface Props {
  actions: Action[]
  setRadical: (radical: boolean) => void
  radical: boolean
}

export default function OptionBar({ actions, setRadical, radical }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useClientTranslation()

  const numberOfAvailableFinalActions = actions.length

  if (!isOpen) {
    return (
      <div className="absolute top-1 right-0 text-right">
        <button
          title={t('Ouvrir les options de tri')}
          onClick={() => {
            setIsOpen(true)
            trackMatomoEvent__deprecated(trackingActionClickSortingButton)
            trackPosthogEvent(captureActionClickSortingButton)
          }}
          className="text-orange-dark focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden">
          <Emoji role="img" aria-label={t('Ouvrir les options de tri')}>
            ⚙️
          </Emoji>
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto my-2 flex items-center justify-center">
      <small role="status">
        {t(
          'publicodes.ActionsOptionsBar.actionsRecap',
          '{{numberOfAvailableFinalActions}} actions disponibles, ',
          {
            numberOfAvailableFinalActions,
          }
        )}

        <ActionsChosenIndicator />
      </small>{' '}
      <small className="hidden md:block">
        <Trans>Triées par :</Trans>
      </small>{' '}
      <small className="block md:hidden">
        <Trans>Tri :</Trans>
      </small>{' '}
      <Button
        size="sm"
        color="text"
        className="underline!"
        onClick={() => setRadical(!radical)}
        title={t('Choisir le type de tri des actions')}>
        {radical ? (
          <span>
            <Trans>le + d'impact climat</Trans>
          </span>
        ) : (
          <span>
            <Trans>le - d'impact climat</Trans>
          </span>
        )}
      </Button>
      <button
        title={t('Fermer les options de tri')}
        onClick={() => setIsOpen(false)}
        className="focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden">
        <CloseIcon />
      </button>
    </div>
  )
}
