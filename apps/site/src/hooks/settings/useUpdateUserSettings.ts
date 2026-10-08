'use client'

import { updateUser } from '@/services/users/update-user'
import { useMutation } from '@tanstack/react-query'

export function useUpdateUserSettings() {
  return useMutation({
    mutationKey: ['updateUserSettings'],
    mutationFn: ({
      email,
      name,
      code,
    }: {
      email?: string
      name?: string
      code?: string
    }) => updateUser({ email, name, code }),
  })
}
