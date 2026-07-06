'use client'

import type { Simulation } from '@/helpers/server/model/simulations'
import { createGroup } from '@/services/groups/create-group'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      name,
      emoji,
      administratorName,
      participants,
    }: {
      name: string
      emoji: string
      administratorName: string
      participants?: { simulation: Simulation }[]
    }) => createGroup({ name, emoji, administratorName, participants }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
