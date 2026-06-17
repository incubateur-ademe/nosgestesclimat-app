import { prisma } from '../../../prisma/client.ts'

type CreateInput = {
  id?: string
  userId: string
  token: string
  expiresAt: Date
  createdAt?: Date
}

export function createRefreshToken(data: CreateInput): Promise<void> {
  return prisma.refreshToken
    .create({ data })
    .then(() => undefined)
}

export function deleteAndReturn(
  hashedToken: string
): Promise<Array<{ id: string; userId: string }>> {
  return prisma.$queryRaw`
    DELETE FROM ngc."RefreshToken"
    WHERE token = ${hashedToken} AND "expiresAt" > NOW()
    RETURNING id, "userId"
  `
}

export function findByToken(
  hashedToken: string
): Promise<{ id: string } | null> {
  return prisma.refreshToken.findFirst({
    where: { token: hashedToken },
    select: { id: true },
  })
}

export function deleteAllForUserId(userId: string): Promise<void> {
  return prisma.refreshToken
    .deleteMany({ where: { userId } })
    .then(() => undefined)
}

export function deleteAllExpired(): Promise<void> {
  return prisma.refreshToken
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .then(() => undefined)
}
