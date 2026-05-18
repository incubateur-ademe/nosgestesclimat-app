import { USER_URL } from '@/constants/urls/main'
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
      ageRange: string
    }) => {
      return await axios
        .put(`${USER_URL}/${userId}`, { ageRange }, { withCredentials: true })
        .then((res) => ({ ...res.data, userId: res.data.id }))
    },
  })
}
