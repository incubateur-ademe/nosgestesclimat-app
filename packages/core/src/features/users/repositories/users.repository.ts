import { prisma } from '../../../prisma/client.ts'
import type { User } from '../types/user.ts'

export const findUserById = async (userId: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { verifiedUsers: true },
  })

  if (!user) return null

  const verifiedUser = user.verifiedUsers[0]
  if (verifiedUser) {
    return {
      type: 'verified',
      id: user.id,
      name: user.name,
      email: verifiedUser.email,
      ageRange: user.ageRange,
      telephone: verifiedUser.telephone,
      position: verifiedUser.position,
      optedInForCommunications: verifiedUser.optedInForCommunications,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  return {
    type: 'unverified',
    id: user.id,
    name: user.name,
    email: null, // user's table email field is deprecated
    ageRange: user.ageRange,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
