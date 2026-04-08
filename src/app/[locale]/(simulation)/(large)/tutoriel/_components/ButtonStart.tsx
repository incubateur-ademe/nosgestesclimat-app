'use client'

import Trans from '@/components/translation/trans/TransClient'
import { tutorielClickSuivant } from '@/constants/tracking/pages/tutoriel'
import { POLL_START_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Loader from '@/design-system/layout/Loader'
import { useSimulateurPage } from '@/hooks/navigation/useSimulateurPage'
import { useFetchPublicPoll } from '@/hooks/organisations/polls/useFetchPublicPoll'
import { useCurrentSimulation, useUser } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const TEST_INTRO_TUTO_KEY = 'testIntro'

export default function ButtonStart({
  label,
  size = undefined,
}: {
  label?: React.ReactNode
  size?: 'xl' | 'lg'
}) {
  const { hideTutorial, tutorials } = useUser()

  const searchParamsString = useSearchParams().toString()

  const { progression, updateCurrentSimulation, polls } = useCurrentSimulation()
  const { getLinkToSimulateurPage } = useSimulateurPage()

  // When component renders, user has seen the tutorial
  useEffect(() => {
    if (!tutorials[TEST_INTRO_TUTO_KEY]) {
      hideTutorial(TEST_INTRO_TUTO_KEY)
    }
  }, [hideTutorial, tutorials])

  const { data: poll, isLoading } = useFetchPublicPoll()

  const [startTime] = useState(() => Date.now())

  // If user has already participated to the poll and the simulation is finished
  if (poll?.simulations.hasParticipated && progression === 1) {
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="mb-0 text-sm text-gray-500">
          <Trans>Vous avez déja participé à ce sondage.</Trans>
        </p>

        <ButtonLink
          href={`/organisations/${poll.organisation.slug}/campagnes/${poll.slug}`}>
          <Trans>Voir mes résultats</Trans>
        </ButtonLink>
      </div>
    )
  }

  // Allow user to choose to keep his/her current simulation or start a new one
  const shouldRedirectToChoicePage = poll && progression === 1

  return (
    <ButtonLink
      href={
        shouldRedirectToChoicePage
          ? `${POLL_START_PATH}?${searchParamsString}`
          : getLinkToSimulateurPage()
      }
      data-testid="skip-tutorial-button"
      aria-disabled={isLoading}
      className="min-w-[167px]!"
      size={size}
      onClick={() => {
        if (isLoading) {
          return
        }

        // Add poll to simulation only when user clicks the button
        // This triggers saving the simulation with SimulationSyncProvider
        if (poll && !polls?.find(({ slug }) => slug === poll.slug)) {
          updateCurrentSimulation({
            pollToAdd: { id: poll.id, slug: poll.slug },
          })
        }

        const endTime = Date.now()
        const timeSpentOnPage = endTime - startTime
        trackMatomoEvent__deprecated(tutorielClickSuivant(timeSpentOnPage))
      }}>
      {isLoading ? (
        <Loader size="sm" />
      ) : (
        (label ?? (
          <>
            <Trans>C'est parti !</Trans> <span aria-hidden="true">→</span>
          </>
        ))
      )}
    </ButtonLink>
  )
}
