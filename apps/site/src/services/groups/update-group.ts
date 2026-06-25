'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Group } from '@/types/groups'
import { withUserId } from '../auth/with-user-id'

export const updateGroup = async ({
  groupId,
  name,
}: {
  groupId: string
  name: string
}) =>
  await withUserId(
    async () =>
      await fetchServer<Group>(`${GROUP_URL}/${groupId}`, {
        method: 'PUT',
        body: { name },
      })
  )
