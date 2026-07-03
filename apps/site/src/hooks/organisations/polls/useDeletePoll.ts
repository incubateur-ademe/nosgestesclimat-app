'luse client'

import { deletePoll } from '@/services/organisations/delete-poll'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export function useDeletePoll() {
  const { pollSlug, orgaSlug } = useParams()

  return useMutation({
    mutationKey: ['organisations', orgaSlug, 'polls', pollSlug],
    mutationFn: () =>
      deletePoll({
        orgaSlug: orgaSlug as string,
        pollSlug: pollSlug as string,
      }),
  })
}
