import { prisma } from '../../../prisma/client.ts'
import type {
  CreateRefreshTokenData,
  DeletedToken,
} from '../types/refresh-token.ts'
import { mapCreateRefreshTokenInput } from './refresh-token.mapper.ts'

export async function createRefreshToken(
  data: CreateRefreshTokenData
): Promise<void> {
  await prisma.refreshToken.create({
    data: mapCreateRefreshTokenInput(data),
  })
}

export async function deleteAndReturn(
  hashedToken: string
): Promise<DeletedToken | null> {
  const rows = await prisma.$queryRaw<DeletedToken[]>`
    DELETE FROM ngc."RefreshToken"
    WHERE token = ${hashedToken} AND "expiresAt" > NOW()
    RETURNING id, "userId"
  `
  return rows[0] ?? null
}

export function findByToken(
  hashedToken: string
): Promise<{ id: string } | null> {
  return prisma.refreshToken.findFirst({
    where: { token: hashedToken },
    select: { id: true },
  })
}

export async function deleteAllForUserId(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } })
}

export async function deleteAllExpired(
  before: Date = new Date()
): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: before } },
  })
}

export function findAllByUserId(
  userId: string
): Promise<{ id: string; token: string; expiresAt: Date }[]> {
  return prisma.refreshToken.findMany({
    where: { userId },
    select: { id: true, token: true, expiresAt: true },
  })
}
