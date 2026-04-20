/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import Trans from '@/components/translation/trans/TransServer'
import { END_PAGE_PATH, SIMULATOR_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import { throwNextError } from '@/helpers/server/error'
import {
  createPollSimulation,
  getPublicPoll,
} from '@/helpers/server/model/poll'
import { getSimulations } from '@/helpers/server/model/simulations'
import { redirect } from 'next/navigation'
import PollTutorialButton from '../../_components/PollTutorialButton'
import ReuseSimulationForPoll from '../../_components/ReuseSimulationForPoll'
import { TrackPoll } from '../../_components/TrackPoll'
import Tutorial from '../../_components/Tutorial'
import YouthTutorial from '../../_components/YouthTutorial'

export default async function Commencer({
  params,
}: PageProps<'/[locale]/simulateur/campagne/[pollIdOrSlug]'>) {
  const { pollIdOrSlug, locale } = await params

  const user = await getUser()
  const [poll, [lastCompletedSimulation]] = await throwNextError(() =>
    Promise.all([
      getPublicPoll({ user, pollIdOrSlug }),
      getSimulations({ user }, { completedOnly: true }),
    ])
  )

  async function createNewSimulation() {
    'use server'
    await createPollSimulation({ pollId: poll.id, user })
    redirect(SIMULATOR_PATH)
  }

  async function reuseSimulation() {
    'use server'
    await createPollSimulation({
      pollId: poll.id,
      user,
      simulation: lastCompletedSimulation,
    })
    redirect(END_PAGE_PATH)
  }

  const allowToReuseExistingSimulation =
    !!lastCompletedSimulation &&
    poll.mode === 'standard' &&
    !poll.simulations.hasParticipated &&
    Date.now() - new Date(lastCompletedSimulation.date as string).getTime() <
      6 * 30 * 24 * 3600 * 1000

  const disclaimer = (
    <div className="relative pl-8">
      <p className="overflow-visible before:absolute before:left-0 before:content-['🏢']">
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
        createNewSimulation={createNewSimulation}
        reuseSimulation={reuseSimulation}
        locale={locale}
        disclaimer={disclaimer}
      />
    )
  }
  const buttonNext = (
    <PollTutorialButton
      poll={poll}
      locale={locale}
      createSimulation={createNewSimulation}
    />
  )
  return (
    <>
      <TrackPoll organisation={poll.organisation.slug} poll={poll.slug} />

      {poll.mode === 'scolaire' ? (
        <YouthTutorial locale={locale} buttonNext={buttonNext} />
      ) : (
        <Tutorial
          locale={locale}
          disclaimer={disclaimer}
          buttonNext={buttonNext}
        />
      )}
    </>
  )
}
