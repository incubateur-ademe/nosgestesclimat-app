import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { hashToken } from '../../helpers/hash-token.ts'
import { findAllByUserId } from '../../repositories/refresh-token.repository.ts'
import { createSession } from '../create-session.service.ts'
import { decryptSession } from '../decrypt-session.service.ts'

let userId: string

describe('createSession', () => {
  beforeEach(async () => {
    const user = await userFactory.create()
    userId = user.id
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('creates a RefreshToken in DB and returns valid tokens', async () => {
    const tokens = await createSession(userId)

    expect(tokens.refreshToken).toBeTruthy()

    const payload = await decryptSession(tokens.accessToken)
    expect.assert(payload)
    expect(payload.userId).toBe(userId)

    const dbTokens = await findAllByUserId(userId)
    expect(dbTokens).toHaveLength(1)
    expect(dbTokens[0].expiresAt.getTime()).toBeGreaterThan(Date.now())
    expect(dbTokens[0].token).toBe(hashToken(tokens.refreshToken))
  })

  it('includes email in access token when provided', async () => {
    const tokens = await createSession(userId, 'test@example.fr')
    const payload = await decryptSession(tokens.accessToken)
    expect.assert(payload)
    expect(payload.email).toBe('test@example.fr')
  })

  it('throws when user does not exist', async () => {
    await expect(
      createSession('00000000-0000-0000-0000-000000000099')
    ).rejects.toThrow()
  })
})
