import { prisma } from '../../../prisma/client.ts'

export const findUserAgeRange = async (
  userId: string
): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ageRange: true },
  })

  return user?.ageRange ?? null
}
