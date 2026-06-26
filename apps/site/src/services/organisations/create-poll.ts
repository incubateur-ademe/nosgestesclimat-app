'use server'

import type { PollDefaultAdditionalQuestion } from '@/constants/organisations/pollDefaultAdditionalQuestion'
import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { OrganisationPoll } from '@/types/organisations'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface PollToCreate {
  name: string
  expectedNumberOfParticipants?: number
  defaultAdditionalQuestions?: PollDefaultAdditionalQuestion[]
  customAdditionalQuestions?: { question: string; isEnabled: boolean }[]
  mode?: 'standard' | 'scolaire'
}

export const createPoll = async ({
  organisationIdOrSlug,
  poll: pollDTO,
  locale,
}: {
  organisationIdOrSlug: string
  poll: PollToCreate
  locale?: string
}) => {
  const params = locale ? `?locale=${locale}` : ''

  const poll = await fetchServer<OrganisationPoll>(
    `${ORGANISATION_URL}/${organisationIdOrSlug}/polls${params}`,
    {
      method: 'POST',
      body: pollDTO,
    }
  )

  revalidatePath(`/organisations/${organisationIdOrSlug}`)
  redirect(`/organisations/${organisationIdOrSlug}/campagnes/${poll.slug}`)
}
