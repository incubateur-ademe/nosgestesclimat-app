'use client'

import { login } from '@/services/auth/login'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from '../useLocale'

export default function useLogin() {
  const locale = useLocale()

  return useMutation({
    gcTime: 30000,
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      login({ email, code, locale }),
  })
}
