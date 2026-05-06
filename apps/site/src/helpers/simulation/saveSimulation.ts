import { ORGANISATION_URL } from '@/constants/urls/main'
import type { Simulation } from '@/helpers/server/model/simulations'
import { postSimulation } from '@/helpers/simulation/postSimulation'
import type { Locale } from '@/i18nConfig'
import { updateGroupParticipant } from '@/services/groups/updateGroupParticipant'
import axios from 'axios'
import { InternalServerError } from '../server/error'

export interface SaveSimulationPayload {
  simulation: Simulation
  userId: string
  name?: string
  locale?: Locale
}

export async function saveSimulation({
  simulation,
  userId,
  locale,
  name,
}: SaveSimulationPayload): Promise<Simulation | undefined> {
  if (simulation.computedResults.carbone.bilan === 0) {
    throw new InternalServerError()
  }

  const { groups = [], polls = [] } = simulation

  if (groups.length) {
    return updateGroupParticipant({
      groupId: groups.at(-1)!.id,
      simulation,
      userId,
      name,
    }).then((response) => response.data.simulation as Simulation)
  }

  if (polls.length) {
    return axios
      .post(
        `${ORGANISATION_URL}/${userId}/public-polls/${polls[polls.length - 1].id}/simulations`,
        simulation,
        {
          params: {
            locale,
          },
        }
      )
      .then((response) => response.data as Simulation)
  }

  return postSimulation({
    simulation,
    userId,
    locale,
  })
}
