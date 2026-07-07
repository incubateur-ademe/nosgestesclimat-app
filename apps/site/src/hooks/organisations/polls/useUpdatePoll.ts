'use client'

import {
  updatePoll,
  type PollToUpdate,
} from '@/services/organisations/update-poll'
import type { OrganisationPoll } from '@/types/organisations'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export type { PollToUpdate }

export function useUpdatePoll(
  options?: UseMutationOptions<OrganisationPoll, Error, PollToUpdate>
) {
  const { orgaSlug, pollSlug } = useParams()

  return useMutation({
    mutationKey: ['organisations', orgaSlug, 'polls', pollSlug],
    mutationFn: (poll: PollToUpdate) =>
      updatePoll({
        orgaSlug: orgaSlug as string,
        pollSlug: pollSlug as string,
        poll,
      }),
    ...options,
  })
}
