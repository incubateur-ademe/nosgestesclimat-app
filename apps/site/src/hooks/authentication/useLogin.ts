import { AUTHENTICATION_URL } from '@/constants/urls/main'
import { useUser } from '@/publicodes-state'
import type { VerifiedUser } from '@/types/organisations'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useLocale } from '../useLocale'

export default function useLogin() {
  const {
    user: { userId },
  } = useUser()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      axios
        .post(
          AUTHENTICATION_URL + '/login',
          {
            code,
            email,
            userId,
          },
          {
            params: {
              locale,
            },
            withCredentials: true,
          }
        )
        .then((response) => {
          return { ...response.data, userId: response.data.id } as VerifiedUser
        }),
  })
}
