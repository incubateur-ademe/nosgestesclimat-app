'use server'

import type { PollDefaultAdditionalQuestion } from '@/constants/organisations/pollDefaultAdditionalQuestion'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { OrganisationPoll } from '@/types/organisations'

export interface PollToUpdate {
  name?: string
  expectedNumberOfParticipants?: number | null
  defaultAdditionalQuestions?: PollDefaultAdditionalQuestion[]
  customAdditionalQuestions?: { question: string; isEnabled: boolean }[]
}

export const updatePoll = async ({
  orgaSlug,
  pollSlug,
  poll,
}: {
  orgaSlug: string
  pollSlug: string
  poll: PollToUpdate
}) =>
  await fetchServer<OrganisationPoll>(
    `${ORGANISATION_URL}/${orgaSlug}/polls/${pollSlug}`,
    {
      method: 'PUT',
      body: poll,
    }
  )
