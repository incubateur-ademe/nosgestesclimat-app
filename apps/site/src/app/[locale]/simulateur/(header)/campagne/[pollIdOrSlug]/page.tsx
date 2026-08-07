import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'

import Emoji from '@/design-system/utils/Emoji'
import { throwNextError } from '@/helpers/server/error'
import { getSimulationMode } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { createPollSimulation } from '@/services/organisations/create-poll-simulation'
import { getPublicPoll } from '@/services/organisations/get-public-poll'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
import { redirect } from 'next/navigation'
import { PollTracker } from '../../../../../../components/tracking/PollTracker'
import PollTutorialButton from '../../_components/PollTutorialButton'
import ReplaceSimulationForPoll from '../../_components/ReplaceSimulationForPoll'
import ReuseSimulationForPoll from '../../_components/ReuseSimulationForPoll'
import Tutorial from '../../_components/Tutorial'
import YouthTutorial from '../../_components/YouthTutorial'

export default async function CampagnePage({
  params,
  searchParams,
}: PageProps<'/[locale]/simulateur/campagne/[pollIdOrSlug]'>) {
  const { pollIdOrSlug, locale } = (await params) as {
    pollIdOrSlug: string
    locale: Locale
  }

  const [poll, [lastCompletedSimulation], currentSimulation] =
    await throwNextError(() =>
      Promise.all([
        getPublicPoll(pollIdOrSlug),
        getCompletedSimulations({ pageSize: 1 }),
        getCurrentSimulation(),
      ])
    )

  if (
    currentSimulation &&
    currentSimulation.progression < 1 &&
    currentSimulation.polls?.some((p) => p.id === poll.id)
  ) {
    redirect(SIMULATOR_PATH)
  }

  async function createNewSimulation() {
    'use server'
    await createPollSimulation({
      poll,
      locale,
      model: await resolveNewSimulationModel({
        searchParams,
        locale,
        mode: poll.mode,
      }),
    })
    redirect(SIMULATOR_PATH)
  }

  async function reuseSimulation() {
    'use server'
    await createPollSimulation({
      poll,
      simulation: lastCompletedSimulation,
      locale,
    })
    redirect(SIMULATOR_PATH)
  }

  // On a shared computer, the session may hold a previous user's completed
  // simulation whose mode differs from this poll's. Such a simulation must be
  // replaced (invisibly) instead of being reused or leaking as results.
  const shouldReplaceSimulation =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !!lastCompletedSimulation &&
    getSimulationMode(lastCompletedSimulation) !== poll.mode

  const allowToReuseExistingSimulation =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !!lastCompletedSimulation &&
    poll.mode === 'standard' &&
    !shouldReplaceSimulation &&
    !poll.simulations.hasParticipated &&
    // eslint-disable-next-line react-hooks/purity
    Date.now() - new Date(lastCompletedSimulation.date as string).getTime() <
      6 * 30 * 24 * 3600 * 1000

  const disclaimer = (
    <div className="relative pl-8">
      <Emoji className="absolute left-0">🏢</Emoji>
      <p>
        <Trans locale={locale}>Ce test vous est proposé par</Trans>{' '}
        <strong>{poll.organisation.name}</strong>.{' '}
        <Trans locale={locale}>
          En participant vous acceptez que vos résultats soient partagés
          anonymement avec cette organisation.
        </Trans>
      </p>
    </div>
  )

  if (allowToReuseExistingSimulation) {
    return (
      <ReuseSimulationForPoll
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        createNewSimulation={createNewSimulation}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        reuseSimulation={reuseSimulation}
        locale={locale}
        disclaimer={disclaimer}
        simulation={lastCompletedSimulation}
      />
    )
  }
  const buttonNext = (
    <PollTutorialButton
      poll={poll}
      locale={locale}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      createSimulation={createNewSimulation}
    />
  )
  return (
    <>
      {shouldReplaceSimulation && <ReplaceSimulationForPoll mode={poll.mode} />}
      <PollTracker poll={poll} />

      {poll.mode === 'scolaire' ? (
        <YouthTutorial locale={locale} buttonNext={buttonNext} />
      ) : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      poll.mode === 'standard' ? (
        <Tutorial
          locale={locale}
          disclaimer={disclaimer}
          buttonNext={buttonNext}
        />
      ) : (
        (poll.mode satisfies never)
      )}
    </>
  )
}
