import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { decryptSession } from '../decrypt-session.service.ts'
import { migrateLegacySessions } from '../migrate-legacy-sessions.service.ts'

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

  it('returns null when no ironUserId provided', async () => {
    const result = await migrateLegacySessions({})
    expect(result).toBeNull()
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
