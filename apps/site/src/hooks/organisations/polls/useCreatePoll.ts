'use client'

import type { PollDefaultAdditionalQuestion } from '@/constants/organisations/pollDefaultAdditionalQuestion'
import type { SimulationMode } from '@/helpers/server/model/simulations'
import { createPoll } from '@/services/organisations/create-poll'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from '../../useLocale'

interface PollToCreate {
  name: string
  expectedNumberOfParticipants?: number
  defaultAdditionalQuestions?: PollDefaultAdditionalQuestion[]
  customAdditionalQuestions?: { question: string; isEnabled: boolean }[]
  mode?: SimulationMode
}

export function useCreatePoll(organisationIdOrSlug: string) {
  const locale = useLocale()

  return useMutation({
    mutationKey: ['organisations', organisationIdOrSlug, 'polls'],
    mutationFn: (poll: PollToCreate) =>
      createPoll({ organisationIdOrSlug, poll, locale }),
  })
}
