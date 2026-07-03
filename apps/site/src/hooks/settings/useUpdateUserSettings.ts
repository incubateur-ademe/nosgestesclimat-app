'use client'

import { updateUser } from '@/services/users/update-user'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { useMutation } from '@tanstack/react-query'

export function useUpdateUserSettings() {
  return useMutation({
    mutationKey: ['updateUserSettings'],
    mutationFn: ({
      email,
      name,
      ageRange,
      code,
    }: {
      email?: string
      name?: string
      ageRange?: AgeRange
      code?: string
    }) => updateUser({ email, name, ageRange, code }),
  })
}
