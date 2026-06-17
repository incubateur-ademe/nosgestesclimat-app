import type { Prisma } from '../../../prisma/generated/client.ts'

export type CreateRefreshTokenData = {
  userId: string
  token: string
  expiresAt: Date
  id?: string
  createdAt?: Date
}

export type DeletedToken = {
  id: string
  userId: string
}

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

export function mapDeletedToken(row: DeletedToken): DeletedToken {
  return row
}
