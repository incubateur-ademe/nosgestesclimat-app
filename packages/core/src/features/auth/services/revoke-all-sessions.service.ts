import { prisma } from '../../../prisma/client.ts'

export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  })
}
