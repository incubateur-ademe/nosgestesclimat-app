import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { verifiedUserFactory } from '../../factories/verified-user.factory.ts'
import { getFullUser } from '../get-full-user.service.ts'

describe('getFullUser', () => {
  afterEach(async () => {
    await Promise.all([
      prisma.verifiedUser.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  it('returns null when no user matches the userId', async () => {
    const result = await getFullUser({
      userId: '00000000-0000-0000-0000-000000000000',
    })
    expect(result).toBeNull()
  })

  it('returns user data when userId exists and no email is provided', async () => {
    const user = await userFactory.create()

    const result = await getFullUser({ userId: user.id })

    expect(result).toEqual({
      ...user,
      telephone: null,
      position: null,
      optedInForCommunications: false,
    })
  })

  it('returns user data merged with verifiedUser fields when email matches', async () => {
    const id = '00000000-0000-0000-0000-000000000000'
    const user = await userFactory.create({ id })

    const verifiedUser = await verifiedUserFactory.create({
      id: user.id,
    })

    const result = await getFullUser({ userId: user.id })

    expect(result).toEqual({
      ...user,
      telephone: verifiedUser.telephone,
      position: verifiedUser.position,
      optedInForCommunications: verifiedUser.optedInForCommunications,
    })
  })

  it('returns user data with null/false defaults when email is provided but no verifiedUser exists', async () => {
    const user = await userFactory.create()

    const result = await getFullUser({
      userId: user.id,
      email: 'non-existent@example.com',
    })

    expect(result).toEqual({
      ...user,
      telephone: null,
      position: null,
      optedInForCommunications: false,
    })
  })
})
