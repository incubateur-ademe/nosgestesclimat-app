'use server'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { Locale } from '@/i18nConfig'
import type { PublicOrganisationPoll } from '@/types/organisations'
import type { AppUser } from '../dal/user'
import { fetchServer } from '../fetchServer'
import type { Model } from './models'
import { stringifyModel } from './models'
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

export async function createPollSimulation(
  props: {
    user: AppUser
    poll: PublicOrganisationPoll
    locale: Locale
  } & (
    | { simulation: Simulation; model?: undefined }
    | { model: Model; simulation?: undefined }
  )
) {
  const { user, poll, locale } = props

  const simulation =
    props.simulation ??
    generateSimulation({ model: stringifyModel(props.model) })

  return fetchServer(
    `${ORGANISATION_URL}/${user.id}/public-polls/${poll.id}/simulations?locale=${locale}`,
    {
      method: 'POST',
      body: simulation,
    }
  )
}
