import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { refreshTokenFactory } from '../../factories/refresh-token.factory.ts'
import { cleanupExpiredTokens } from '../cleanup-expired-tokens.service.ts'

const USER_ID = '00000000-0000-0000-0000-000000000001'

describe('cleanupExpiredTokens', () => {
  beforeEach(async () => {
    await prisma.user.create({ data: { id: USER_ID } })
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('deletes expired tokens and keeps valid ones', async () => {
    await refreshTokenFactory.expired().create({ userId: USER_ID })
    const valid = await refreshTokenFactory.create({ userId: USER_ID })

    await cleanupExpiredTokens()

    const remaining = await prisma.refreshToken.findMany()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(valid.id)
  })

  it('keeps valid tokens when there are no expired ones', async () => {
    const valid = await refreshTokenFactory.create({ userId: USER_ID })

    await cleanupExpiredTokens()

    const remaining = await prisma.refreshToken.findMany()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(valid.id)
  })
})
