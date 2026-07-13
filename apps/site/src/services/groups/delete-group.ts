'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { UnauthorizedError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import { getUserSession } from '../auth/get-user-session'

export const deleteGroup = async (groupId: string) => {
  const session = await getUserSession()
  if (!session) {
    throw new UnauthorizedError()
  }
  return await fetchServer<void>(`${GROUP_URL}/${groupId}`, {
    method: 'DELETE',
    session,
  })
}
