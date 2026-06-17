import { prisma } from '../../../prisma/client.ts'

export async function cleanupExpiredTokens(): Promise<number> {
  return prisma.$executeRaw`
    DELETE FROM ngc."RefreshToken" WHERE "expiresAt" < NOW()
  `
}
