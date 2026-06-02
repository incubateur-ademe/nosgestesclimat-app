import { findUser, findVerifiedUser } from '../repositories/users.repository.ts'
import type { FullUser } from '../types/user.ts'

export const getFullUser = async ({
  userId,
  email,
}: {
  userId: string
  email?: string
}): Promise<FullUser | null> => {
  const [user, verifiedUser] = await Promise.all([
    findUser(userId),
    email ? findVerifiedUser(email) : Promise.resolve(null),
  ])

  if (!user) return null

  return {
    ...user,
    telephone: verifiedUser?.telephone ?? null,
    position: verifiedUser?.position ?? null,
    optedInForCommunications: verifiedUser?.optedInForCommunications ?? false,
  }
}
