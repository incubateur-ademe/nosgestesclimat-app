import { GROUP_URL } from '@/constants/urls/main'
import type { Group } from '@/types/groups'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface MutationFnType {
  groupId: string
  name: string
}
export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, name }: MutationFnType) =>
      axios.put<Group>(`${GROUP_URL}/${groupId}`, {
        name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
