'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import { revalidatePath } from 'next/cache'
import { withUserSession } from '../auth/with-user-session'

export const updateGroupParticipant = async ({
  groupId,
  simulation,
  name = '',
}: {
  groupId: string
  simulation: Simulation
  name?: string
}) =>
  await withUserSession(async (session) => {
    const result = await fetchServer(`${GROUP_URL}/${groupId}/participants`, {
      method: 'POST',
      body: {
        simulation,
        name,
      },
      session,
    })
    revalidatePath('/amis/resultats')
    return result
  })
