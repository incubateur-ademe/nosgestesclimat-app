import { prisma } from '../../../prisma/client.ts'
import type { User, VerifiedUser } from '../../../prisma/generated/client.ts'

export const findUser = async (userId: string): Promise<User | null> =>
  prisma.user.findUnique({
    where: { id: userId },
  })

export const findVerifiedUser = async (
  userId: string
): Promise<VerifiedUser | null> =>
  // id is not @unique, can't be used with findUnique
  prisma.verifiedUser.findFirst({
    where: { id: userId },
  })
