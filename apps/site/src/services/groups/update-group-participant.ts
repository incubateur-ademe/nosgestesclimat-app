'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import { revalidatePath } from 'next/cache'
import { withUserId } from '../auth/with-user-id'

export const updateGroupParticipant = async ({
  groupId,
  simulation,
  name = '',
}: {
  groupId: string
  simulation: Simulation
  name?: string
}) =>
  await withUserId(async (userId) => {
    const result = await fetchServer(`${GROUP_URL}/${groupId}/participants`, {
      method: 'POST',
      body: {
        simulation,
        userId,
        name,
      },
    })
    revalidatePath('/amis/resultats')
    return result
  })
