'use client'

import Trans from '@/components/translation/trans/TransClient'
import { endClickActions } from '@/constants/tracking/pages/end'
import { MON_ESPACE_ACTIONS_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import RecommendedActions from './howToAct/RecommendedActions'

export default function HowToAct({
  shouldLeadToTest = true,
}: {
  shouldLeadToTest?: boolean
}) {
  return (
    <>
      <h2>
        <Trans>Comment agir ?</Trans>
      </h2>

      <p className="text-gray-600">
        {shouldLeadToTest ? (
          <Trans>
            Découvrez nos pistes pour agir dès aujourd’hui pour le climat, ou
            passez le test pour obtenir des recommandations personnalisées.
          </Trans>
        ) : (
          <Trans>
            Découvrez nos pistes pour agir dès aujourd’hui pour le climat.
          </Trans>
        )}
      </p>

      <RecommendedActions />

      <div className="mt-4">
        <ButtonLink
          href={MON_ESPACE_ACTIONS_PATH}
          color="secondary"
          trackingEvent={endClickActions}>
          <Trans>Voir toutes les actions</Trans>
        </ButtonLink>
      </div>
    </>
  )
}
