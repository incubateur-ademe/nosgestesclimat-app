'use client'

import Trans from '@/components/translation/trans/TransClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'

export default function ButtonNext() {
  return (
    <ButtonLink
      isClickableOnce
      href={SIMULATOR_PATH}
      data-testid="skip-tutorial-button"
      className="min-w-42!">
      <Trans i18nKey="simulator.tutorial.letsGoButton.label">
        C'est parti !
      </Trans>{' '}
      <span aria-hidden="true" className="ml-1">
        →
      </span>
    </ButtonLink>
  )
}
