import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { createSession } from '../create-session.service.ts'
import { revokeAllSessions } from '../revoke-all-sessions.service.ts'

const USER_1 = '00000000-0000-0000-0000-000000000001'
const USER_2 = '00000000-0000-0000-0000-000000000002'

describe('revokeAllSessions', () => {
  beforeEach(async () => {
    await prisma.user.create({ data: { id: USER_1 } })
    await prisma.user.create({ data: { id: USER_2 } })
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('deletes all refresh tokens for a given user', async () => {
    await createSession(USER_1)
    await createSession(USER_1)
    await createSession(USER_2)

    await revokeAllSessions(USER_1)

    const user1Tokens = await prisma.refreshToken.count({
      where: { userId: USER_1 },
    })
    const user2Tokens = await prisma.refreshToken.count({
      where: { userId: USER_2 },
    })

    expect(user1Tokens).toBe(0)
    expect(user2Tokens).toBe(1)
  })
})
