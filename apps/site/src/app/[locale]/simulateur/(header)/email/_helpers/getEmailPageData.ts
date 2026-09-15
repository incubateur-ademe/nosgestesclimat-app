import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import { toSimulationDto } from '@/services/simulations/simulation.dto'
import { findManyPollSummariesBySimulationId } from '@nosgestesclimat/core/features/polls/repositories/poll.repository'
import { getSimulationMode } from '@nosgestesclimat/core/features/simulations/helpers/get-simulation-mode'
import { findLatestSimulation } from '@nosgestesclimat/core/features/simulations/repository/simulation.repository'
import { notFound } from 'next/navigation'

interface EmailPageData {
  isSchoolMode: boolean
  hasContest: boolean
  currentSimulation: Simulation
  organisationName?: string
}

// TODO: create a service instead of calling repositories directly in action
export async function getEmailPageData(): Promise<EmailPageData> {
  const user = await getUserSession()
  if (!user) notFound()
  const currentSimulation = await findLatestSimulation({ userId: user.id })
  if (!currentSimulation) notFound()

  const [poll] = await findManyPollSummariesBySimulationId({
    simulationId: currentSimulation.id,
  })
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const pollSlug = poll?.slug

  const simulationMode = getSimulationMode(currentSimulation)
  const isSchoolMode = simulationMode === 'scolaire'
  const hasContest =
    !!pollSlug &&
    (process.env.NEXT_PUBLIC_POLL_CONTEST_SLUGS ?? '')
      .split(',')
      .includes(pollSlug)

  const organisationName =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    poll && hasContest ? poll.organisation.name : undefined

  return {
    currentSimulation: toSimulationDto(currentSimulation),
    isSchoolMode,
    hasContest,
    organisationName,
  }
}
