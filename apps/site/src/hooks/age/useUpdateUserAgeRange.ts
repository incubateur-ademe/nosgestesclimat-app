import { USER_URL } from '@/constants/urls/main'
import { fetchClient } from '@/helpers/client/fetchClient'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { useMutation } from '@tanstack/react-query'

export function useUpdateUserAgeRange() {
  return useMutation({
    mutationKey: ['updateUserAgeRange'],
    mutationFn: async ({
      userId,
      ageRange,
    }: {
      userId: string
      ageRange: AgeRange
    }) => {
      const data = await fetchClient<{ id: string }>(`${USER_URL}/${userId}`, {
        method: 'PUT',
        body: { ageRange },
      })
      return { ...data, userId: data.id }
    },
  })
}
