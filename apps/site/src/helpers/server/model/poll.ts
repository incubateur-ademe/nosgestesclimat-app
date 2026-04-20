'use server'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { PublicOrganisationPoll } from '@/types/organisations'
import type { AppUser } from '../dal/user'
import { fetchServer } from '../fetchServer'
import type { Simulation } from './simulations'

export async function getPublicPoll({
  user,
  pollIdOrSlug,
}: {
  user: AppUser
  pollIdOrSlug: string
}): Promise<PublicOrganisationPoll> {
  return fetchServer<PublicOrganisationPoll>(
    `${ORGANISATION_URL}/${user.id}/public-polls/${pollIdOrSlug}`
  )
}

export async function getPublicPollSimulations({
  user,
  pollIdOrSlug,
}: {
  user: AppUser
  pollIdOrSlug: string
}): Promise<Simulation[]> {
  return fetchServer(
    `${ORGANISATION_URL}/${user.id}/public-polls/${pollIdOrSlug}/simulations`
  )
}

export async function createPollSimulation({
  user,
  pollId,
  simulation = generateSimulation(),
}: {
  user: AppUser
  pollId: string
  simulation?: Simulation
}) {
  return fetchServer(
    `${ORGANISATION_URL}/${user.id}/public-polls/${pollId}/simulations`,
    {
      method: 'POST',
      body: simulation,
    }
  )
}
