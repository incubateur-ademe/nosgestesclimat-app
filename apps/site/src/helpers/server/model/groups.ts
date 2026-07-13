'use server'

import { GROUP_URL } from '@/constants/urls/main'
import type { Group } from '@/types/groups'
import { fetchServer } from '../fetchServer'

export async function getGroups(): Promise<Group[]> {
  return await fetchServer<Group[]>(GROUP_URL)
}

export async function getGroup({
  groupId,
}: {
  groupId: string
}): Promise<Group> {
  return await fetchServer<Group>(`${GROUP_URL}/${groupId}`)
}
