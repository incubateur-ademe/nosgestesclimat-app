import { USER_URL } from '@/constants/urls/main'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

export function useUpdateUserSettings() {
  return useMutation({
    mutationKey: ['updateUserSettings'],
    mutationFn: async ({
      userId,
      email,
      name,
      ageRange,
      code,
    }: {
      userId: string
      email?: string
      name?: string
      ageRange?: AgeRange
      code?: string
    }) => {
      return await axios
        .put(
          `${USER_URL}/${userId}`,
          {
            email,
            name,
            ageRange,
          },
          {
            params: {
              code,
            },
            withCredentials: true,
          }
        )
        .then((res) => ({ ...res.data, userId: res.data.id }))
    },
  })
}
