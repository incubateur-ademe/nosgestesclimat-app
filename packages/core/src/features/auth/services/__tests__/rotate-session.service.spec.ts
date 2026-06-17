import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { refreshTokenFactory } from '../../factories/refresh-token.factory.ts'
import { createSession } from '../create-session.service.ts'
import { rotateSession } from '../rotate-session.service.ts'
import { TokenExpiredException } from '../../exceptions/token-expired.exception.ts'
import { TokenConsumedException } from '../../exceptions/token-consumed.exception.ts'

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
    expect(result.accessToken).toBeTruthy()
  })

  it('throws TokenConsumedException when token is already used (replay)', async () => {
    const { refreshToken } = await createSession(USER_ID)
    await rotateSession(refreshToken)
    await expect(rotateSession(refreshToken)).rejects.toThrow(
      TokenConsumedException
    )
  })

  it('throws TokenConsumedException for an invalid refresh token', async () => {
    await expect(rotateSession('invalid-token')).rejects.toThrow(
      TokenConsumedException
    )
  })

  it('throws TokenExpiredException for an expired refresh token', async () => {
    const { token } = await refreshTokenFactory
      .expired()
      .create({ userId: USER_ID })
    await expect(rotateSession(token)).rejects.toThrow(
      TokenExpiredException
    )
  })
})
