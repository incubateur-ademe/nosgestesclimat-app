'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'

export const deletePoll = async ({
  orgaSlug,
  pollSlug,
}: {
  orgaSlug: string
  pollSlug: string
}) =>
  fetchServer<void>(`${ORGANISATION_URL}/${orgaSlug}/polls/${pollSlug}`, {
    method: 'DELETE',
  })
