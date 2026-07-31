'use server'

import { SIMULATION_URL } from '@/constants/urls/main'
import { UnauthorizedError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import { getUserSession } from '@/services/auth/get-user-session'

export const deleteSimulation = async (simulationId: string) => {
  const session = await getUserSession()
  if (!session) throw new UnauthorizedError()

  await fetchServer(`${SIMULATION_URL}/${simulationId}`, {
    method: 'DELETE',
  })
}
