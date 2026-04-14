import { GROUP_URL } from '@/constants/urls/main'
import { useUser } from '@/publicodes-state'
import type { Group } from '@/types/groups'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface MutationFnType {
  groupId: string
  name: string
}
export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  const {
    user: { userId },
  } = useUser()

  return useMutation({
    mutationFn: ({ groupId, name }: MutationFnType) =>
      axios.put<Group>(`${GROUP_URL}/${userId}/${groupId}`, {
        name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
