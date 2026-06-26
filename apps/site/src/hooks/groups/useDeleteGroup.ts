'use client'

import { useUser } from '@/publicodes-state'
import { deleteGroup } from '@/services/groups/delete-group'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Props {
  shouldInvalidateQueries?: boolean
}

export function useDeleteGroup(props?: Props) {
  const { shouldInvalidateQueries = true } = props || {}

  const queryClient = useQueryClient()

  const { updateCurrentSimulation } = useUser()

  return useMutation({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: (_, groupId) => {
      updateCurrentSimulation({ groupToDelete: groupId })
      if (shouldInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
      }
    },
  })
}
