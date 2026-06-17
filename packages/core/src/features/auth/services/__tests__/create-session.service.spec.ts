import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { createSession } from '../create-session.service.ts'
import { decryptSession } from '../decrypt-session.service.ts'

const USER_ID = '00000000-0000-0000-0000-000000000001'

describe('createSession', () => {
  beforeEach(async () => {
    await prisma.user.create({ data: { id: USER_ID } })
  })

  afterEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('creates a RefreshToken in DB and returns valid tokens', async () => {
    const tokens = await createSession(USER_ID)

    const payload = await decryptSession(tokens.accessToken)
    expect.assert(payload)
    expect(payload.userId).toBe(USER_ID)

    const dbToken = await prisma.refreshToken.findFirst({
      where: { userId: USER_ID },
    })
    expect(dbToken).not.toBeNull()
  })

  it('includes email in access token when provided', async () => {
    const tokens = await createSession(USER_ID, 'test@exemple.fr')
    const payload = await decryptSession(tokens.accessToken)
    expect.assert(payload)
    expect(payload.email).toBe('test@exemple.fr')
  })
})
