import jwt from 'jsonwebtoken'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { findAllByUserId } from '../../repositories/refresh-token.repository.ts'
import { decryptSession } from '../decrypt-session.service.ts'
import { migrateLegacySessions } from '../migrate-legacy-sessions.service.ts'

const LEGACY_JWT_SECRET = process.env.LEGACY_JWT_SECRET!

let userId: string

describe('migrateLegacySessions', () => {
  beforeEach(async () => {
    const user = await userFactory.create()
    userId = user.id
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('returns null when neither jwt nor ironUserId provided', async () => {
    const result = await migrateLegacySessions({})
    expect(result).toBeNull()
  })

  it('migrates JWT: verifies legacy HS256 token, creates session', async () => {
    const token = jwt.sign(
      { userId, email: 'test@example.fr' },
      LEGACY_JWT_SECRET,
      { expiresIn: '2 days' }
    )

    const tokens = await migrateLegacySessions({ jwt: token })
    expect.assert(tokens)

    const payload = await decryptSession(tokens.accessToken)
    expect(payload.userId).toBe(userId)
    expect(payload.email).toBe('test@example.fr')

    const dbTokens = await findAllByUserId(userId)
    expect(dbTokens).toHaveLength(1)
  })

  it('migrates ironUserId: finds existing user, creates session', async () => {
    const tokens = await migrateLegacySessions({ ironUserId: userId })
    expect.assert(tokens)

    const payload = await decryptSession(tokens.accessToken)
    expect(payload.userId).toBe(userId)
    expect(payload.email).toBeUndefined()
  })

  it('returns null when ironUserId user does not exist', async () => {
    const result = await migrateLegacySessions({
      ironUserId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result).toBeNull()
  })
})
