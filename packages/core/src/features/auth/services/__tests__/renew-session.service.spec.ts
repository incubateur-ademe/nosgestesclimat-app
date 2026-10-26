import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { findUserLastActivityAt } from '../../../users/repositories/users.repository.ts'
import { SESSION_ROTATION_TOLERANCE_SECONDS } from '../../constants/session.ts'
import { refreshTokenFactory } from '../../factories/refresh-token.factory.ts'
import { hashToken } from '../../helpers/hash-token.ts'
import {
  findAllByUserId,
  findByPreviousToken,
} from '../../repositories/refresh-token.repository.ts'
import { renewSession } from '../renew-session.service.ts'

let userId: string

/** Puts the last rotation beyond the tolerance window. */
const ageRotation = (ms: number) =>
  prisma.refreshToken.updateMany({
    where: { userId },
    data: { rotatedAt: new Date(Date.now() - ms) },
  })

describe('renewSession', () => {
  beforeEach(async () => {
    const user = await userFactory.create()
    userId = user.id
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('rotates the key in place and keeps the replaced one', async () => {
    const { token } = await refreshTokenFactory.create({ userId })

    const outcome = await renewSession({ refreshToken: token })

    expect.assert(outcome.status === 'rotated')

    const rows = await findAllByUserId(userId)
    expect(rows).toHaveLength(1)
    expect(rows[0].token).toBe(hashToken(outcome.tokens.refreshToken!))

    expect(await findByPreviousToken(hashToken(token))).toMatchObject({
      userId,
      rotatedAt: expect.any(Date),
    })
  })

  it('does not push the expiry back', async () => {
    const { token } = await refreshTokenFactory.create({ userId })
    const [before] = await findAllByUserId(userId)

    await renewSession({ refreshToken: token })

    // `expiresAt` carries the 180-day ceiling: a renewal that moved it would
    // make the session immortal.
    const [after] = await findAllByUserId(userId)
    expect(after.expiresAt).toEqual(before.expiresAt)
  })

  it('treats a concurrent request as such and issues no new key', async () => {
    const { token } = await refreshTokenFactory.create({ userId })

    const outcomes = await Promise.all([
      renewSession({ refreshToken: token }),
      renewSession({ refreshToken: token }),
    ])
    const statuses = outcomes.map((outcome) => outcome.status).sort()

    expect(statuses).toEqual(['concurrent', 'rotated'])
    expect(await findAllByUserId(userId)).toHaveLength(1)

    const concurrent = outcomes.find(
      (outcome) => outcome.status === 'concurrent'
    )
    expect.assert(concurrent?.status === 'concurrent')
    // Handing a key back would overwrite the winner's cookie.
    expect(concurrent.tokens.refreshToken).toBeUndefined()
    expect(concurrent.ageMs).toBeLessThan(
      SESSION_ROTATION_TOLERANCE_SECONDS * 1000
    )
  })

  it('revokes the family when the replaced key comes back late', async () => {
    const { token } = await refreshTokenFactory.create({ userId })
    await renewSession({ refreshToken: token })
    await ageRotation(SESSION_ROTATION_TOLERANCE_SECONDS * 1000 + 1_000)

    const outcome = await renewSession({ refreshToken: token })

    expect.assert(outcome.status === 'replayed')
    expect(outcome.ageMs).toBeGreaterThan(
      SESSION_ROTATION_TOLERANCE_SECONDS * 1000
    )
    expect(await findAllByUserId(userId)).toHaveLength(0)
  })

  it('reports an unknown key without touching another session', async () => {
    await refreshTokenFactory.create({ userId })

    const outcome = await renewSession({ refreshToken: 'never-issued' })

    expect(outcome.status).toBe('unrecognised')
    expect(await findAllByUserId(userId)).toHaveLength(1)
  })

  it('reports an expired key as unrecognised', async () => {
    const { token } = await refreshTokenFactory.expired().create({ userId })

    const outcome = await renewSession({ refreshToken: token })

    expect(outcome.status).toBe('unrecognised')
  })

  it('records the activity of the user whose session was renewed', async () => {
    const { token } = await refreshTokenFactory.create({ userId })
    expect(await findUserLastActivityAt({ userId })).toBeNull()

    await renewSession({ refreshToken: token })

    // The retention sweep reads this stamp, and the renewal is now what writes
    // it.
    expect(await findUserLastActivityAt({ userId })).toEqual(expect.any(Date))
  })
})
