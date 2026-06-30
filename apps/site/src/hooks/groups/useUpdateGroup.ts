'use client'

import { updateGroup } from '@/services/groups/update-group'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
      updateGroup({ groupId, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
