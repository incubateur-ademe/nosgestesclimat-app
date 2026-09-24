import type { Simulation } from '@/helpers/server/model/simulations'
import { getSimulationMode } from '@nosgestesclimat/core/features/simulations/helpers/get-simulation-mode'
import { getLatestSimulationResult } from '@nosgestesclimat/core/features/simulations/services/get-latest-simulation-result.service'

import { getUserSession } from '@/services/auth/get-user-session'
import { toSimulationDto } from '@/services/simulations/simulation.dto'
import { notFound } from 'next/navigation'

interface EmailPageData {
  isSchoolMode: boolean
  hasContest: boolean
  currentSimulation: Simulation
  organisationName?: string
}

export async function getEmailPageData(): Promise<EmailPageData> {
  const user = await getUserSession()
  if (!user) notFound()

  const result = await getLatestSimulationResult({
    userId: user.id,
    withTendency: false,
  })
  if (!result) notFound()

  const poll = result.group?.type === 'poll' ? result.group.value : undefined

  const isSchoolMode = getSimulationMode(result.simulation) === 'scolaire'
  const hasContest =
    poll !== undefined &&
    (process.env.NEXT_PUBLIC_POLL_CONTEST_SLUGS ?? '')
      .split(',')
      .includes(poll.slug)

  const organisationName =
    poll && hasContest ? poll.organisation.name : undefined

  return {
    currentSimulation: toSimulationDto(result.simulation),
    isSchoolMode,
    hasContest,
    organisationName,
  }
}
