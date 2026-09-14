import { findUserById } from '../repositories/users.repository.ts'
import type { User } from '../types/user.ts'

export const getUser = async ({
  userId,
}: {
  userId: string
}): Promise<User | null> => findUserById(userId)
