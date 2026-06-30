'use server'

import { USER_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { withUserId } from '../auth/with-user-id'

export const updateUser = async ({
  email,
  name,
  ageRange,
  code,
}: {
  email?: string
  name?: string
  ageRange?: AgeRange
  code?: string
}) => {
  return withUserId(async (userId) => {
    const params = code ? `?code=${code}` : ''

    const data = await fetchServer<{ id: string }>(
      `${USER_URL}/${userId}${params}`,
      {
        method: 'PUT',
        body: { email, name, ageRange },
      }
    )

    return { ...data, userId: data.id }
  })
}
