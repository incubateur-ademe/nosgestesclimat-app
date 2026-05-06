import Trans from '@/components/translation/trans/TransServer'
import { END_PAGE_PATH, SIMULATOR_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import { throwNextError } from '@/helpers/server/error'
import { createPollSimulation, getUserPoll } from '@/helpers/server/model/poll'
import {
  getCompletedSimulations,
  getCurrentSimulation,
} from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { redirect } from 'next/navigation'
import { PollTracker } from '../../../../../../components/tracking/PollTracker'
import { getNewSimulationModelService } from '../../../_service/getNewSimulationModelService'
import PollTutorialButton from '../../_components/PollTutorialButton'
import ReuseSimulationForPoll from '../../_components/ReuseSimulationForPoll'
import Tutorial from '../../_components/Tutorial'
import YouthTutorial from '../../_components/YouthTutorial'

export default async function Commencer({
  params,
  searchParams,
}: PageProps<'/[locale]/simulateur/campagne/[pollIdOrSlug]'>) {
  const { pollIdOrSlug, locale } = (await params) as {
    pollIdOrSlug: string
    locale: Locale
  }

  const user = await getUser()
  const [poll, [lastCompletedSimulation], currentSimulation] =
    await throwNextError(() =>
      Promise.all([
        getUserPoll({ user, pollIdOrSlug }),
        getCompletedSimulations({ user }, { pageSize: 1 }),
        getCurrentSimulation({ user }),
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
      user,
      locale,
      model: await getNewSimulationModelService({
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
      user,
      simulation: lastCompletedSimulation,
      locale,
    })
    redirect(END_PAGE_PATH)
  }

  const allowToReuseExistingSimulation =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !!lastCompletedSimulation &&
    poll.mode === 'standard' &&
    !poll.simulations.hasParticipated &&
    // eslint-disable-next-line react-hooks/purity
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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        createNewSimulation={createNewSimulation}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      createSimulation={createNewSimulation}
    />
  )
  return (
    <>
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
