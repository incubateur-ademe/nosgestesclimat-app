'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { UnauthorizedError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Simulation } from '@/helpers/server/model/simulations'
import { getUserSession } from '@/services/auth/get-user-session'
import type { Group } from '@/types/groups'

export const createGroup = async ({
  name,
  emoji,
  administratorName,
  participants,
}: {
  name: string
  emoji: string
  administratorName: string
  participants?: { simulation: Simulation }[]
}) => {
  const session = await getUserSession()
  if (!session?.isAuth) {
    throw new UnauthorizedError()
  }

  return await fetchServer<Group>(GROUP_URL, {
    method: 'POST',
    body: {
      name,
      emoji,
      administrator: {
        name: administratorName,
      },
      participants,
    },
  })
}
