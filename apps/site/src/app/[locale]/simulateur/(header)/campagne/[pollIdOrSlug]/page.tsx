import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'

import Emoji from '@/design-system/utils/Emoji'
import type { Locale } from '@/i18nConfig'
import { participateToPoll } from '@/services/organisations/participate-to-poll'
import { resolveNewSimulationModel } from '@/services/simulations/resolve-new-simulation-model'
import type { Poll } from '@nosgestesclimat/core/features/polls/types/poll'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
import type { SearchParams } from 'next/dist/server/request/search-params'
import { redirect } from 'next/navigation'
import { PollTracker } from '../../../../../../components/tracking/PollTracker'
import PollTutorialButton from '../../_components/PollTutorialButton'
import ReuseSimulationForPoll from '../../_components/ReuseSimulationForPoll'
import Tutorial from '../../_components/Tutorial'
import YouthTutorial from '../../_components/YouthTutorial'
import { getPollParticipationOptions } from './_actions/get-poll-participation-options'

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
          case 'standard':
            return <YouthTutorial locale={locale} buttonNext={buttonNext} />
          case 'scolaire':
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
