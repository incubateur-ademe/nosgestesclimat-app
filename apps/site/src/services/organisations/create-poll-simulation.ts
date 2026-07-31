'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { stringifyModel, type Model } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type { Locale } from '@/i18nConfig'
import { withUserSession } from '@/services/auth/with-user-session'
import type { PublicOrganisationPoll } from '@/types/organisations'

export const createPollSimulation = async ({
  poll,
  locale,
  simulation,
  model,
}: {
  poll: PublicOrganisationPoll
  locale: Locale
  simulation?: Simulation
  model?: Model
}) =>
  await withUserSession(async (session) => {
    const sim =
      simulation ?? generateSimulation({ model: stringifyModel(model!) })

    return await fetchServer(
      `${ORGANISATION_URL}/public-polls/${poll.id}/simulations?locale=${locale}`,
      {
        method: 'POST',
        body: sim,
        session,
      }
    )
  })
