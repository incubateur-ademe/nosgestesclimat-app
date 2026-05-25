import { findUserAgeRange } from '../repositories/users.repository.ts'
import type { AgeRange } from '../types/age-range.ts'

export const getUserAgeRange = async (
  userId: string
): Promise<AgeRange | null> => findUserAgeRange(userId)
