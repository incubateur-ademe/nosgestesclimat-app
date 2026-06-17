'use server'

import { getUser } from '@/services/users/get-user'
import { getFullUser } from '@nosgestesclimat/core/features/users/services/get-full-user.service'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'

export async function getUserAgeRange(): Promise<AgeRange | null> {
  const user = await getUser()

  const fullUser = await getFullUser({ userId: user.id })

  return fullUser?.ageRange ?? null
}
