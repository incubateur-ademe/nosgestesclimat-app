import { GROUP_URL } from '@/constants/urls/main'
import type { Simulation } from '@/helpers/server/model/simulations'
import axios from 'axios'

export const updateGroupParticipant = async ({
  groupId,
  simulation,
  name = '',
}: {
  groupId: string
  simulation: Simulation
  name?: string
}) => {
  return axios.post(`${GROUP_URL}/${groupId}/participants`, {
    simulation,
    name,
  })
}
