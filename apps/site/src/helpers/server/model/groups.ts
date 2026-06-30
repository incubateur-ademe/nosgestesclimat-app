'use server'

import { GROUP_URL } from '@/constants/urls/main'
import type { AppUser, UserSession } from '@/services/auth/get-user-session'
import type { Group } from '@/types/groups'
import { fetchServer } from '../fetchServer'

export async function getGroups({ user }: { user: AppUser }): Promise<Group[]> {
  return fetchServer<Group[]>(`${GROUP_URL}/${user.id}`)
}

/**
 * Default user ID used when no session is available.
 * This is used for public access, such as fetching public polls.
 * @see {@link getPublicPoll} in {@link @/services/organisations/get-public-poll.ts}
 */
const NO_SESSION_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function getGroup({
  groupId,
  user,
}: {
  groupId: string
  user: UserSession
}): Promise<Group> {
  return fetchServer<Group>(
    `${GROUP_URL}/${user?.id ?? NO_SESSION_USER_ID}/${groupId}`
  )
}
