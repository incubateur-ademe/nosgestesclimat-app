'use client'

import { GROUP_URL } from '@/constants/urls/main'
import { useUser } from '@/publicodes-state'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface Props {
  shouldInvalidateQueries?: boolean
}

export function useDeleteGroup(props?: Props) {
  const { shouldInvalidateQueries = true } = props || {}

  const queryClient = useQueryClient()

  const { updateCurrentSimulation } = useUser()

  return useMutation({
    mutationFn: ({ groupId }: { groupId: string }) =>
      axios.delete<void>(`${GROUP_URL}/${groupId}`),
    onSuccess: (_, variables) => {
      updateCurrentSimulation({ groupToDelete: variables.groupId })
      if (shouldInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
      }
    },
  })
}
