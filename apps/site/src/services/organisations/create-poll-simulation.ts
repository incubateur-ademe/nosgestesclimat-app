'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { stringifyModel, type Model } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { withUserSession } from '@/services/auth/with-user-session'
import { buildNewSimulationPayload } from '@/services/simulations/build-new-simulation-payload'
import type { PublicOrganisationPoll } from '@/types/organisations'

/**
 * Either reuse an existing simulation or create a new one
 */
type CreatePollSimulationArgs = {
  poll: PublicOrganisationPoll
  locale: Locale
} & (
  | { simulation: Simulation; model?: never }
  | { simulation?: never; model: Model }
)

export const createPollSimulation = async ({
  poll,
  locale,
  simulation,
  model,
}: CreatePollSimulationArgs) =>
  await withUserSession(async (session) => {
    const sim =
      simulation ?? buildNewSimulationPayload({ model: stringifyModel(model) })

    return await fetchServer(
      `${ORGANISATION_URL}/public-polls/${poll.id}/simulations?locale=${locale}`,
      {
        method: 'POST',
        body: sim,
        session,
      }
    )
  })
