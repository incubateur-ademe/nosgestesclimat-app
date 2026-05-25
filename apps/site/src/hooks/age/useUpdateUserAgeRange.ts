import { USER_URL } from '@/constants/urls/main'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

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
      return await axios
        .put(`${USER_URL}/${userId}`, { ageRange }, { withCredentials: true })
        .then((res) => ({ ...res.data, userId: res.data.id }))
    },
  })
}
