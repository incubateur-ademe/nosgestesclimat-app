import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'

import Emoji from '@/design-system/utils/Emoji'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/auth/get-user-session'
import { participateToPoll } from '@/services/organisations/participate-to-poll'
import { getPollSummary } from '@/services/polls/get-poll-summary'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
import type {
  Poll,
  PollSummary,
} from '@nosgestesclimat/core/features/polls/types/poll'
import { getSimulationMode } from '@nosgestesclimat/core/features/simulations/helpers/get-simulation-mode'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
import { getLastCompletedSimulation } from '@nosgestesclimat/core/features/simulations/services/get-last-completed-simulation.service'
import { getPollParticipation } from '@nosgestesclimat/core/features/simulations/services/get-poll-participation.service'
import type { SearchParams } from 'next/dist/server/request/search-params'
import { notFound, redirect } from 'next/navigation'
import { PollTracker } from '../../../../../../components/tracking/PollTracker'
import { toSimulationDto } from '../../../../../../services/simulations/simulation.dto'
import PollTutorialButton from '../../_components/PollTutorialButton'
import ReuseSimulationForPoll from '../../_components/ReuseSimulationForPoll'
import Tutorial from '../../_components/Tutorial'
import YouthTutorial from '../../_components/YouthTutorial'

type Options =
  | {
      poll: PollSummary
      currentPollSimulation: Simulation | null
      canReuseExistingSimulation: false
    }
  | {
      poll: PollSummary
      currentPollSimulation: Simulation | null
      canReuseExistingSimulation: true
      reusableSimulation: Simulation
      reusableSimulationPolls: PollSummary[]
    }

async function getPollParticipationOptions(
  pollIdOrSlug: string
): Promise<Options> {
  const session = await getUserSession()
  const poll = await getPollSummary(pollIdOrSlug)

  if (!poll) notFound()
  if (!session)
    return {
      poll,
      currentPollSimulation: null,
      canReuseExistingSimulation: false,
    }

  const [currentPollSimulation, maybeReusableSimulation] = await Promise.all([
    getPollParticipation({ userId: session.id, pollIdOrSlug }),
    getLastCompletedSimulation({ userId: session.id }),
  ])

  if (currentPollSimulation && !isSimulationCompleted(currentPollSimulation)) {
    redirect(SIMULATOR_PATH)
  }

  const currentPollSimulationDto = currentPollSimulation
    ? toSimulationDto(currentPollSimulation)
    : null

  // A completed simulation is only offered for reuse when :
  // - the previous completed simulation has "mode" === "standard"
  // - the newer simulation also has "mode" === "standard"
  const canReuseExistingSimulation =
    !!maybeReusableSimulation &&
    poll.mode === 'standard' &&
    getSimulationMode(maybeReusableSimulation) === 'standard' &&
    !currentPollSimulation &&
    Date.now() - maybeReusableSimulation.date.getTime() <
      6 * 30 * 24 * 3600 * 1000

  if (!canReuseExistingSimulation)
    return {
      poll,
      currentPollSimulation: currentPollSimulationDto,
      canReuseExistingSimulation,
    }

  // TODO
  // const reusableSimulationPolls = await polls()

  return {
    poll,
    currentPollSimulation: currentPollSimulationDto,
    canReuseExistingSimulation,
    reusableSimulation: toSimulationDto(maybeReusableSimulation),
    reusableSimulationPolls: [],
  }
}

export default async function CampagnePage({
  params,
  searchParams: _searchParams,
}: PageProps<'/[locale]/simulateur/campagne/[pollIdOrSlug]'>) {
  const { pollIdOrSlug, locale } = (await params) as {
    pollIdOrSlug: string
    locale: Locale
  }
  const searchParams = await _searchParams

  const data = await getPollParticipationOptions(pollIdOrSlug)
  const poll = data.poll

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

  if (data.canReuseExistingSimulation) {
    return (
      <>
        <PollTracker poll={poll} />

        <ReuseSimulationForPoll
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          createNewSimulation={() =>
            createNewSimulation({
              pollId: poll.id,
              mode: poll.mode,
              searchParams,
              locale,
            })
          }
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          reuseSimulation={() =>
            reuseSimulation({
              pollId: poll.id,
              reuseSimulationId: data.reusableSimulation.id,
              locale,
            })
          }
          locale={locale}
          disclaimer={disclaimer}
          simulation={data.reusableSimulation}
          polls={data.reusableSimulationPolls}
        />
      </>
    )
  }
  const buttonNext = (
    <PollTutorialButton
      poll={poll}
      hasCompletedPollSimulation={
        !!data.currentPollSimulation &&
        isSimulationCompleted(data.currentPollSimulation)
      }
      locale={locale}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      createSimulation={() =>
        createNewSimulation({
          pollId: poll.id,
          mode: poll.mode,
          searchParams,
          locale,
        })
      }
    />
  )

  return (
    <>
      <PollTracker poll={poll} />

      {(() => {
        switch (poll.mode) {
          case 'scolaire':
            return <YouthTutorial locale={locale} buttonNext={buttonNext} />
          case 'standard':
            return (
              <Tutorial
                locale={locale}
                disclaimer={disclaimer}
                buttonNext={buttonNext}
              />
            )
          default:
            poll.mode satisfies never
            return null
        }
      })()}
    </>
  )
}

const createNewSimulation = async ({
  pollId,
  mode,
  searchParams,
  locale,
}: {
  pollId: string
  mode: Poll['mode']
  searchParams: SearchParams
  locale: Locale
}) => {
  'use server'
  const model = await resolveNewSimulationModel({
    searchParams,
    locale,
    mode,
  })
  const result = await participateToPoll({
    pollId: pollId,
    locale,
    model,
  })
  if (!result.success) return result
  redirect(SIMULATOR_PATH)
}

const reuseSimulation = async ({
  pollId,
  reuseSimulationId,
  locale,
}: {
  pollId: string
  reuseSimulationId: string
  locale: Locale
}) => {
  'use server'
  const result = await participateToPoll({
    pollId,
    locale,
    reuseSimulationId,
  })
  if (!result.success) return result
  redirect(SIMULATOR_PATH)
}
