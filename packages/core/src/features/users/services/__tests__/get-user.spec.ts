import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { verifiedUserFactory } from '../../factories/verified-user.factory.ts'
import { getUser } from '../get-user.service.ts'

describe('getUser', () => {
  afterEach(async () => {
    await Promise.all([
      prisma.verifiedUser.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  it('returns null when no user matches the userId', async () => {
    const result = await getUser({
      userId: '00000000-0000-0000-0000-000000000000',
    })
    expect(result).toBeNull()
  })

  it('returns an unverified user when only a user exists', async () => {
    const user = await userFactory.create()

    const result = await getUser({ userId: user.id })

    expect(result).toEqual({
      type: 'unverified',
      id: user.id,
      name: user.name,
      email: null,
      ageRange: user.ageRange,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  })

  it('returns a verified user when a verified user with the same userId exists', async () => {
    const id = '00000000-0000-0000-0000-000000000000'
    const user = await userFactory.create({ id })

    const verifiedUser = await verifiedUserFactory.create({
      id: user.id,
    })

    const result = await getUser({ userId: user.id })

    expect(result).toEqual({
      type: 'verified',
      id: user.id,
      name: user.name,
      email: verifiedUser.email,
      ageRange: user.ageRange,
      telephone: verifiedUser.telephone,
      position: verifiedUser.position,
      optedInForCommunications: verifiedUser.optedInForCommunications,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  })
})
