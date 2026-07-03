'use server'

import { MON_ESPACE_GROUPS_PATH } from '@/constants/urls/paths'
import { deleteGroup } from '@/services/groups/delete-group'
import { redirect } from 'next/navigation'

export async function deleteGroupAction(
  _prevState: void | undefined,
  formData: FormData
) {
  const groupId = formData.get('groupId') as string
  await deleteGroup(groupId)
  redirect(MON_ESPACE_GROUPS_PATH)
}
