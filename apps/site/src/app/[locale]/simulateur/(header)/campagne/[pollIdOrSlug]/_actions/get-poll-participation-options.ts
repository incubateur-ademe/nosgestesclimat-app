import { SIMULATOR_PATH } from '@/constants/urls/paths'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { getPollSummary } from '@/services/polls/get-poll-summary'
import { toSimulationDto } from '@/services/simulations/simulation.dto'
import { getPollParticipationOptions as getPollParticipationOptionsService } from '@nosgestesclimat/core/features/polls/services/get-poll-participation-options.service'
import type { PollSummary } from '@nosgestesclimat/core/features/polls/types/poll'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
import { notFound, redirect } from 'next/navigation'

export type PollParticipationOptions =
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

export async function getPollParticipationOptions(
  pollIdOrSlug: string
): Promise<PollParticipationOptions> {
  const [session, poll] = await Promise.all([
    getUserSession(),
    getPollSummary(pollIdOrSlug),
  ])

  if (!poll) notFound()
  if (!session)
    return {
      poll,
      currentPollSimulation: null,
      canReuseExistingSimulation: false,
    }

  const data = await getPollParticipationOptionsService({
    poll,
    userId: session.id,
  })

  const { currentPollSimulation } = data

  if (currentPollSimulation && !isSimulationCompleted(currentPollSimulation)) {
    redirect(SIMULATOR_PATH)
  }

  const currentPollSimulationDto = currentPollSimulation
    ? toSimulationDto(currentPollSimulation)
    : null

  if (!data.canReuseExistingSimulation)
    return {
      poll,
      currentPollSimulation: currentPollSimulationDto,
      canReuseExistingSimulation: data.canReuseExistingSimulation,
    }

  return {
    poll,
    currentPollSimulation: currentPollSimulationDto,
    canReuseExistingSimulation: data.canReuseExistingSimulation,
    reusableSimulation: toSimulationDto(data.reusableSimulation),
    reusableSimulationPolls: data.reusableSimulationPolls,
  }
}
