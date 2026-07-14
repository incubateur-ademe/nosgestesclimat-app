import { getSimulationMode } from '@/helpers/server/model/simulations'
import { getPublicPoll } from '@/helpers/server/model/organisations'
import type { Simulation } from '@/helpers/server/model/simulations'

interface EmailPageData {
  isSchoolMode: boolean
  pollSlug: string | undefined
  hasContest: boolean
  organisationName: string | undefined
}

export async function getEmailPageData(
  currentSimulation: Simulation
): Promise<EmailPageData> {
  const simulationMode = getSimulationMode(currentSimulation)
  const isSchoolMode = simulationMode === 'scolaire'
  const pollSlug = currentSimulation.polls?.[0]?.slug
  const hasContest =
    !!pollSlug &&
    (process.env.NEXT_PUBLIC_POLL_CONTEST_SLUGS ?? '')
      .split(',')
      .includes(pollSlug)

  let organisationName: string | undefined

  if (hasContest && pollSlug) {
    const poll = await getPublicPoll(pollSlug)
    organisationName = poll?.organisation.name
  }

  return {
    isSchoolMode,
    pollSlug,
    hasContest,
    organisationName,
  }
}
