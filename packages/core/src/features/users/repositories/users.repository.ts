import { prisma } from '../../../prisma/client.ts'
import type { AgeRange } from '../types/age-range.ts'

export const findUserAgeRange = async (
  userId: string
): Promise<AgeRange | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ageRange: true },
  })

  return (user?.ageRange ?? null) as AgeRange | null
}
