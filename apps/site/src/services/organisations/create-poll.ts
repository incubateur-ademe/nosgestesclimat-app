'use server'

import type { PollDefaultAdditionalQuestion } from '@/constants/organisations/pollDefaultAdditionalQuestion'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { OrganisationPoll } from '@/types/organisations'

interface PollToCreate {
  name: string
  expectedNumberOfParticipants?: number
  defaultAdditionalQuestions?: PollDefaultAdditionalQuestion[]
  customAdditionalQuestions?: { question: string; isEnabled: boolean }[]
  mode?: 'standard' | 'scolaire'
}

export const createPoll = async ({
  organisationIdOrSlug,
  poll,
  locale,
}: {
  organisationIdOrSlug: string
  poll: PollToCreate
  locale?: string
}) => {
  const params = locale ? `?locale=${locale}` : ''

  return fetchServer<OrganisationPoll>(
    `${ORGANISATION_URL}/${organisationIdOrSlug}/polls${params}`,
    {
      method: 'POST',
      body: poll,
    }
  )
}
