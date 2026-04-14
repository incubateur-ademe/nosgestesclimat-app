import { GROUP_URL } from '@/constants/urls/main'
import type { Simulation } from '@/publicodes-state/types'
import axios from 'axios'

export const updateGroupParticipant = async ({
  groupId,
  email,
  simulation,
  userId,
  name = '',
}: {
  groupId: string
  email?: string
  simulation: Simulation
  userId: string
  name?: string
}) => {
  return axios.post(`${GROUP_URL}/${groupId}/participants`, {
    ...(email ? { email } : {}),
    simulation,
    userId,
    name,
  })
}
