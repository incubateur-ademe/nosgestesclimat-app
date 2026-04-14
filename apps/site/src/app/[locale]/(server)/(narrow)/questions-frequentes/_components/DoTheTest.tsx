'use client'

import Trans from '@/components/translation/trans/TransClient'
import InlineLink from '@/design-system/inputs/InlineLink'
import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import { useCurrentSimulation } from '@/publicodes-state'

export default function DoTheTest() {
  const { progression } = useCurrentSimulation()

  if (progression === 0) {
    return (
      <div>
        <Trans i18nKey="faq.doTheTest.notStarted">
          Vous n'avez pas encore débuté votre test,{' '}
          <InlineLink href={getLinkToSimulateur()}>
            <strong>lancez-vous !</strong>
          </InlineLink>
        </Trans>
      </div>
    )
  }

  return (
    <div>
      <Trans i18nKey="faq.doTheTest.started">
        Vous avez commencé votre test,{' '}
        <InlineLink href={getLinkToSimulateur()}>
          <strong>cliquez ici pour le reprendre !</strong>
        </InlineLink>
      </Trans>
    </div>
  )
}
