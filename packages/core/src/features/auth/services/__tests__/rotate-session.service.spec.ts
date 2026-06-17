import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { refreshTokenFactory } from '../../factories/refresh-token.factory.ts'
import { createSession } from '../create-session.service.ts'
import { rotateSession } from '../rotate-session.service.ts'

const USER_ID = '00000000-0000-0000-0000-000000000001'

describe('rotateSession', () => {
  beforeEach(async () => {
    await prisma.user.create({ data: { id: USER_ID } })
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('returns new tokens and preserves email on rotation', async () => {
    const { refreshToken } = await createSession(USER_ID, 'user@test.com')

    const result = await rotateSession(refreshToken, 'user@test.com')
    expect.assert(result)
    expect(result.accessToken).toBeTruthy()
  })

  it('returns null when token is already used (replay)', async () => {
    const { refreshToken } = await createSession(USER_ID)
    await rotateSession(refreshToken)
    const replay = await rotateSession(refreshToken)
    expect(replay).toBeNull()
  })

  it('returns null for invalid refresh token', async () => {
    const result = await rotateSession('invalid-token')
    expect(result).toBeNull()
  })

  it('returns null for an expired refresh token', async () => {
    const { token } = await refreshTokenFactory.expired().create({ userId: USER_ID })
    const result = await rotateSession(token)
    expect(result).toBeNull()
  })
})
