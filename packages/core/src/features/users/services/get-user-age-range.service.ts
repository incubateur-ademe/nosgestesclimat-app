import { findUserAgeRange } from '../repositories/users.repository.ts'

export const getUserAgeRange = async (
  userId: string
): Promise<string | null> => findUserAgeRange(userId)
