import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { TokenConsumedException } from '../../exceptions/token-consumed.exception.ts'
import { TokenExpiredException } from '../../exceptions/token-expired.exception.ts'
import { refreshTokenFactory } from '../../factories/refresh-token.factory.ts'
import { hashToken } from '../../helpers/hash-token.ts'
import { findAllByUserId } from '../../repositories/refresh-token.repository.ts'
import { createSession } from '../create-session.service.ts'
import { decryptSession } from '../decrypt-session.service.ts'
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
  it('returns new tokens on rotation', async () => {
    const email = faker.internet.email()
    const { refreshToken } = await createSession(USER_ID, email)

    const result = await rotateSession(refreshToken, email)
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    expect(result.refreshToken).not.toBe(refreshToken)

    const dbTokens = await findAllByUserId(USER_ID)
    expect(dbTokens).toHaveLength(1)
    expect(dbTokens[0].token).toBe(hashToken(result.refreshToken))
  })

  it('preserves the email in the payload on rotation', async () => {
    const initialEmail = faker.internet.email()
    const updatedEmail = faker.internet.email()
    const { refreshToken } = await createSession(USER_ID, initialEmail)
    const result = await rotateSession(refreshToken, updatedEmail)
    const payload = await decryptSession(result.accessToken)
    expect(payload.email).toBe(updatedEmail)
  })

  it('throws TokenConsumedException when token is already used (replay)', async () => {
    const { refreshToken } = await createSession(USER_ID)
    await rotateSession(refreshToken)
    await expect(rotateSession(refreshToken)).rejects.toThrow(
      TokenConsumedException
    )
  })

  it('throws TokenConsumedException for an unrecognised refresh token', async () => {
    await expect(rotateSession('invalid-token')).rejects.toThrow(
      TokenConsumedException
    )
  })

  it('throws TokenExpiredException for an expired refresh token', async () => {
    const { token } = await refreshTokenFactory
      .expired()
      .create({ userId: USER_ID })
    await expect(rotateSession(token)).rejects.toThrow(TokenExpiredException)
  })
})
