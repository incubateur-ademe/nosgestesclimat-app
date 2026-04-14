import { GROUP_URL } from '@/constants/urls/main'
import type { Simulation } from '@/publicodes-state/types'
import type { Group } from '@/types/groups'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface MutateAsyncProps {
  groupInfo: {
    name: string
    emoji: string
    administrator: {
      userId: string
      name: string
      email?: string
    }
    participants?: {
      simulation: Simulation
    }[]
  }
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      groupInfo: { name, emoji, administrator, participants },
    }: MutateAsyncProps) =>
      axios
        .post<Group>(GROUP_URL, {
          name,
          emoji,
          administrator,
          participants,
        })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
