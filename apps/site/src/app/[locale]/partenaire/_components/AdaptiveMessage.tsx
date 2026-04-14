'use client'

import RedirectTimer from '@/components/interactions/RedirectTimer'
import MessageTemplate from '@/components/layout/MessageTemplate'
import Trans from '@/components/translation/trans/TransClient'
import { PARTNER_2TONNES, PARTNER_JAGIS } from '@/constants/partners'
import { usePartner } from '@/contexts/partner/PartnerContext'
import Alert from '@/design-system/alerts/alert/Alert'
import Emoji from '@/design-system/utils/Emoji'
import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import { useCurrentSimulation } from '@/publicodes-state'
import RedirectLink from './RedirectLink'

const PARTNER_NAMES = {
  [PARTNER_JAGIS]: "J'agis",
  [PARTNER_2TONNES]: '2tonnes',
}

export default function AdaptiveMessage({ partner }: { partner: string }) {
  const { progression } = useCurrentSimulation()

  const isTestCompleted = progression === 1

  const { redirectUrl, alertToDisplay } = usePartner()

  const href = isTestCompleted ? redirectUrl : getLinkToSimulateur()

  const isError = alertToDisplay?.type === 'error'
  const partnerName = PARTNER_NAMES[partner as keyof typeof PARTNER_NAMES]

  return (
    <MessageTemplate
      title={
        <>
          <span>
            <Trans>Notre partenaire</Trans>
          </span>
          {partnerName ? (
            <strong className="text-primary-700"> {partnerName}</strong>
          ) : (
            ''
          )}{' '}
          <Trans>
            vous a invité à lui transmettre vos empreintes carbone et eau.
          </Trans>
        </>
      }
      description={
        <>
          {isTestCompleted ? (
            <p data-testid="redirection-message">
              <Trans>C'est chose faite !</Trans> <Emoji>✅</Emoji>{' '}
              <Trans>
                Vous allez être redirigé vers le site de notre partenaire dans :
              </Trans>
            </p>
          ) : (
            <p data-testid="test-message">
              <Trans>
                Vous allez être redirigé vers notre calculateur dans :
              </Trans>
            </p>
          )}

          {!isError && <RedirectTimer href={href} />}

          {isError && (
            <Alert
              type="error"
              className="mx-auto mt-8 w-2xl max-w-full"
              description={alertToDisplay?.content}
            />
          )}
        </>
      }
      buttonElement={
        <RedirectLink href={href}>
          {isTestCompleted ? (
            <Trans>Aller sur le site partenaire maintenant</Trans>
          ) : (
            <Trans>Commencer le test maintenant</Trans>
          )}
        </RedirectLink>
      }
    />
  )
}
