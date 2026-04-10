'use client'

import { GROUP_URL } from '@/constants/urls/main'
import { useUser } from '@/publicodes-state'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useRemoveParticipant() {
  const queryClient = useQueryClient()
  const { updateCurrentSimulation } = useUser()
  return useMutation({
    mutationFn: ({
      participantId,
      groupId,
      userId,
    }: {
      participantId: string
      groupId: string
      userId: string
    }) =>
      axios.delete<void>(
        `${GROUP_URL}/${userId}/${groupId}/participants/${participantId}`
      ),
    onSuccess: (data, variables) => {
      updateCurrentSimulation({ groupToDelete: variables.groupId })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
