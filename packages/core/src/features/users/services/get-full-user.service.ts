import { findUser, findVerifiedUser } from '../repositories/users.repository.ts'
import type { FullUser } from '../types/user.ts'

export const getFullUser = async ({
  userId,
}: {
  userId: string
}): Promise<FullUser | null> => {
  const [user, verifiedUser] = await Promise.all([
    findUser(userId),
    findVerifiedUser(userId),
  ])

  if (!user) return null

  return {
    ...user,
    telephone: verifiedUser?.telephone ?? null,
    position: verifiedUser?.position ?? null,
    optedInForCommunications: verifiedUser?.optedInForCommunications ?? false,
  }
}
