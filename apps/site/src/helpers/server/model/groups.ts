'use server'

import { GROUP_URL } from '@/constants/urls/main'
import type { Group } from '@/types/groups'
import type { AppUser } from '../dal/user'
import { fetchServer } from '../fetchServer'

export async function getGroups({ user }: { user: AppUser }): Promise<Group[]> {
  return fetchServer<Group[]>(`${GROUP_URL}/${user.id}`)
}

export async function getGroup({
  groupId,
  user,
}: {
  groupId: string
  user: AppUser
}): Promise<Group> {
  return fetchServer<Group>(`${GROUP_URL}/${user.id}/${groupId}`)
}
