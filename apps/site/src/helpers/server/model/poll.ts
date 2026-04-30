'use server'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { getModelVersion } from '@/helpers/modelFetching/getModelVersion'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { Locale } from '@/i18nConfig'
import type { PublicOrganisationPoll } from '@/types/organisations'
import type { AppUser } from '../dal/user'
import { InternalServerError } from '../error'
import { fetchServer } from '../fetchServer'
import type { Simulation } from './simulations'

export async function getUserPoll({
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

export async function createPollSimulation({
  user,
  poll,
  simulation,
  locale,
}: {
  user: AppUser
  poll: PublicOrganisationPoll
  simulation?: Simulation
  locale: Locale
}) {
  if (poll.mode === 'scolaire' && simulation) {
    throw new InternalServerError()
  }

  simulation ??= {
    ...generateSimulation(),
    model: getModelVersion({ mode: poll.mode, locale }),
  }

  return fetchServer(
    `${ORGANISATION_URL}/${user.id}/public-polls/${poll.id}/simulations?locale=${locale}`,
    {
      method: 'POST',
      body: simulation,
    }
  )
}
