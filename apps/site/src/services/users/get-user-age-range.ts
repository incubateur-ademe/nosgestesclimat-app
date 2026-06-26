'use server'

import { getUserSession } from '@/services/users/get-user-session'
import { getFullUser } from '@nosgestesclimat/core/features/users/services/get-full-user.service'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'

export async function getUserAgeRange(): Promise<AgeRange | null> {
  const user = await getUserSession()

  const fullUser = await getFullUser({ userId: user.id })

  return fullUser?.ageRange ?? null
}
