'use server'

import { GROUP_URL } from '@/constants/urls/main'
import type { AppUser } from '@/services/users/get-user-session'
import type { Group } from '@/types/groups'
import { fetchServer } from '../fetchServer'

export async function getGroups({
  user: _user,
}: {
  user: AppUser
}): Promise<Group[]> {
  return fetchServer<Group[]>(GROUP_URL)
}

export async function getGroup({
  groupId,
  user: _user,
}: {
  groupId: string
  user: AppUser
}): Promise<Group> {
  return fetchServer<Group>(`${GROUP_URL}/${groupId}`)
}
