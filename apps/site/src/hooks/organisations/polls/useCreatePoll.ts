import type { PollDefaultAdditionalQuestion } from '@/constants/organisations/pollDefaultAdditionalQuestion'
import { ORGANISATION_URL } from '@/constants/urls/main'
import type { OrganisationPoll } from '@/types/organisations'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useLocale } from '../../useLocale'

interface PollToCreate {
  name: string
  expectedNumberOfParticipants?: number
  defaultAdditionalQuestions?: PollDefaultAdditionalQuestion[]
  customAdditionalQuestions?: { question: string; isEnabled: boolean }[]
}

export function useCreatePoll(organisationIdOrSlug: string) {
  const locale = useLocale()

  return useMutation({
    mutationKey: ['organisations', organisationIdOrSlug, 'polls'],
    mutationFn: (pollToCreate: PollToCreate) =>
      axios
        .post<OrganisationPoll>(
          `${ORGANISATION_URL}/${organisationIdOrSlug}/polls`,
          pollToCreate,
          {
            params: {
              locale,
            },
            withCredentials: true,
          }
        )
        .then((res) => res.data),
  })
}
