import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { findAllByUserId } from '../../repositories/refresh-token.repository.ts'
import { createSession } from '../create-session.service.ts'
import { revokeAllSessions } from '../revoke-all-sessions.service.ts'

const USER_ID = '00000000-0000-0000-0000-000000000001'
const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'

describe('revokeAllSessions', () => {
  beforeEach(async () => {
    await prisma.user.create({ data: { id: USER_ID } })
    await prisma.user.create({ data: { id: OTHER_USER_ID } })
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('deletes all refresh tokens for a given user', async () => {
    await createSession(USER_ID)
    await createSession(USER_ID)
    await createSession(OTHER_USER_ID)

    await revokeAllSessions(USER_ID)

    const user1Tokens = await findAllByUserId(USER_ID)
    const user2Tokens = await findAllByUserId(OTHER_USER_ID)

    expect(user1Tokens).toHaveLength(0)
    expect(user2Tokens).toHaveLength(1)
  })

  it('does nothing when user has no sessions', async () => {
    await createSession(OTHER_USER_ID)

    await revokeAllSessions(USER_ID)

    const userTokens = await findAllByUserId(USER_ID)
    const otherTokens = await findAllByUserId(OTHER_USER_ID)

    expect(userTokens).toHaveLength(0)
    expect(otherTokens).toHaveLength(1)
  })
})
