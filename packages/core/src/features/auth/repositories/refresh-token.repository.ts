import { failure, success, type Result } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import { isPrismaErrorNotFound } from '../../../prisma/utils.ts'
import { RefreshTokenNotFoundError } from '../errors/refresh-token.error.ts'
import type { CreateRefreshTokenData } from '../types/refresh-token.ts'
import { mapCreateRefreshTokenInput } from './refresh-token.mapper.ts'

export async function createRefreshToken(
  data: CreateRefreshTokenData
): Promise<void> {
  await prisma.refreshToken.create({
    data: mapCreateRefreshTokenInput(data),
  })
}

/**
 * Rewrites the row's key in place, keeping the replaced key in `previousToken`:
 * that is how a caller that could not rewrite it learns when it was rewritten.
 */
export async function rotateToken({
  hashedToken,
  newHashedToken,
}: {
  hashedToken: string
  newHashedToken: string
}): Promise<Result<{ userId: string }, RefreshTokenNotFoundError>> {
  const now = new Date()

  try {
    const rotated = await prisma.refreshToken.update({
      where: { token: hashedToken, expiresAt: { gt: now } },
      data: {
        token: newHashedToken,
        previousToken: hashedToken,
        rotatedAt: now,
      },
      select: { userId: true },
    })

    return success(rotated)
  } catch (error) {
    if (isPrismaErrorNotFound(error)) {
      return failure(new RefreshTokenNotFoundError())
    }
    throw error
  }
}

/** The live row that carries `hashedToken` as the key it replaced. */
export function findByPreviousToken(hashedToken: string): Promise<{
  id: string
  userId: string
  rotatedAt: Date | null
} | null> {
  return prisma.refreshToken.findFirst({
    where: { previousToken: hashedToken, expiresAt: { gt: new Date() } },
    select: { id: true, userId: true, rotatedAt: true },
  })
}

export async function deleteAllRefreshTokensForUserId(
  userId: string,
  { session = prisma }: { session?: Transaction }
): Promise<void> {
  await session.refreshToken.deleteMany({ where: { userId } })
}

export async function deleteAllExpired(
  before: Date = new Date()
): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: before } },
  })
}

export function findAllRefreshTokenByUserId(
  userId: string
): Promise<{ id: string; token: string; expiresAt: Date }[]> {
  return prisma.refreshToken.findMany({
    where: { userId },
    select: { id: true, token: true, expiresAt: true },
  })
}
