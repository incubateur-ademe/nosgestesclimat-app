import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { refreshTokenFactory } from '../../factories/refresh-token.factory.ts'
import { findAllByUserId } from '../../repositories/refresh-token.repository.ts'
import { cleanupExpiredTokens } from '../cleanup-expired-tokens.service.ts'

let userId: string

describe('cleanupExpiredTokens', () => {
  beforeEach(async () => {
    const user = await userFactory.create()
    userId = user.id
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('deletes expired tokens and keeps valid ones', async () => {
    await refreshTokenFactory.expired().create({ userId })
    const valid = await refreshTokenFactory.create({ userId })

    await cleanupExpiredTokens()

    const remaining = await findAllByUserId(userId)
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(valid.id)
  })

  it('does nothing when there are no tokens', async () => {
    await cleanupExpiredTokens()

    const remaining = await findAllByUserId(userId)
    expect(remaining).toHaveLength(0)
  })
})
