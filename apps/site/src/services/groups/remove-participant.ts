'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { UnauthorizedError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import { getUserSession } from '../auth/get-user-session'

export const removeParticipant = async ({
  groupId,
  participantId,
}: {
  groupId: string
  participantId: string
}) => {
  const session = await getUserSession()

  if (!session) {
    throw new UnauthorizedError()
  }

  return fetchServer<void>(
    `${GROUP_URL}/${session.id}/${groupId}/participants/${participantId}`,
    {
      method: 'DELETE',
      session,
    }
  )
}
