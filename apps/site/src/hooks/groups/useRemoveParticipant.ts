'use client'

import { useUser } from '@/publicodes-state'
import { removeParticipant } from '@/services/groups/remove-participant'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRemoveParticipant() {
  const queryClient = useQueryClient()
  const { updateCurrentSimulation } = useUser()

  return useMutation({
    mutationFn: ({
      participantId,
      groupId,
    }: {
      participantId: string
      groupId: string
    }) => removeParticipant({ groupId, participantId }),
    onSuccess: (_, variables) => {
      updateCurrentSimulation({ groupToDelete: variables.groupId })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
