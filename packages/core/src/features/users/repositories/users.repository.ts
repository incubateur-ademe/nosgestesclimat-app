import { prisma } from '../../../prisma/client.ts'
import type { User, VerifiedUser } from '../../../prisma/generated/client.ts'

export const findUser = async (userId: string): Promise<User | null> =>
  prisma.user.findUnique({
    where: { id: userId },
  })

export const findVerifiedUser = async (
  email: string
): Promise<VerifiedUser | null> =>
  prisma.verifiedUser.findUnique({
    where: { email },
  })
