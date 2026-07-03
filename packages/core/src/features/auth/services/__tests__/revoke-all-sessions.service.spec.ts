import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { findAllByUserId } from '../../repositories/refresh-token.repository.ts'
import { createSession } from '../create-session.service.ts'
import { revokeAllSessions } from '../revoke-all-sessions.service.ts'

let userId: string
let otherUserId: string

describe('revokeAllSessions', () => {
  beforeEach(async () => {
    const user = await userFactory.create()
    const otherUser = await userFactory.create()
    userId = user.id
    otherUserId = otherUser.id
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('deletes all refresh tokens for a given user', async () => {
    await createSession(userId)
    await createSession(userId)
    await createSession(otherUserId)

    await revokeAllSessions(userId)

    const user1Tokens = await findAllByUserId(userId)
    const user2Tokens = await findAllByUserId(otherUserId)

    expect(user1Tokens).toHaveLength(0)
    expect(user2Tokens).toHaveLength(1)
  })

  it('does nothing when user has no sessions', async () => {
    await createSession(otherUserId)

    await revokeAllSessions(userId)

    const userTokens = await findAllByUserId(userId)
    const otherTokens = await findAllByUserId(otherUserId)

    expect(userTokens).toHaveLength(0)
    expect(otherTokens).toHaveLength(1)
  })
})
