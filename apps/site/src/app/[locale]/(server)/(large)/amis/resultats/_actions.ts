'use server'

import { GROUP_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { revalidatePath } from 'next/cache'

export async function updateGroupParticipantAction(data: {
  groupId: string
  simulation: {
    id: string
    date: string | Date
    situation: Record<string, unknown>
    computedResults?: Record<string, unknown>
    progression?: number
  }
  name: string
}) {
  await fetchServer(`${GROUP_URL}/${data.groupId}/participants`, {
    method: 'POST',
    body: {
      simulation: data.simulation,
      name: data.name,
    },
  })
  revalidatePath('/amis/resultats')
}
