import type { Prisma } from '../../../prisma/generated/client.ts'
import type { CreateRefreshTokenData } from '../types/refresh-token.ts'

export function mapCreateRefreshTokenInput(
  data: CreateRefreshTokenData
): Prisma.RefreshTokenCreateInput {
  return {
    id: data.id,
    user: { connect: { id: data.userId } },
    token: data.token,
    expiresAt: data.expiresAt,
    createdAt: data.createdAt,
  }
}
