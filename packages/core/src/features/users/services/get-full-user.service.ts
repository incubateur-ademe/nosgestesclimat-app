import type { User, VerifiedUser } from '../../../prisma/generated/client.ts'
import { findUser, findVerifiedUser } from '../repositories/users.repository.ts'

type MergedUser = User &
  Pick<VerifiedUser, 'telephone' | 'position' | 'optedInForCommunications'>

export const getFullUser = async ({
  userId,
  email,
}: {
  userId: string
  email?: string
}): Promise<MergedUser | null> => {
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
