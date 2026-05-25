'use server'

import { getUser } from '@/helpers/server/dal/user'
import { getUserAgeRange as getUserAgeRangeService } from '@nosgestesclimat/core/features/users/services/get-user-age-range.service'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'

export async function getUserAgeRange(): Promise<AgeRange | null> {
  const user = await getUser()

  const ageRange = await getUserAgeRangeService(user.id)

  return ageRange
}
