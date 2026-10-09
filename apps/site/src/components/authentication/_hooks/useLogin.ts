'use client'

import { useLocale } from '@/hooks/useLocale'
import { login } from '@/services/auth/login'
import type { Intent } from '@nosgestesclimat/core/features/auth/schemas/auth.schema'
import { useMutation } from '@tanstack/react-query'

export function useLogin() {
  const locale = useLocale()

  return useMutation({
    gcTime: 30000,
    mutationFn: ({
      email,
      code,
      intent,
    }: {
      email: string
      code: string
      intent: Intent
    }) => login({ email, code, locale, intent }),
  })
}
