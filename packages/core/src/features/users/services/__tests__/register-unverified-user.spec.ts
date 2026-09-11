import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { findUserById } from '../../repositories/users.repository.ts'
import { registerUnverifiedUser } from '../register-unverified-user.service.ts'

describe('registerUnverifiedUser', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  it('creates an anonymous account with a generated id', async () => {
    const user = await registerUnverifiedUser()

    expect(user).toEqual({
      type: 'unverified',
      id: expect.any(String),
      name: null,
      email: null,
      ageRange: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(await findUserById(user.id)).toEqual(user)
  })

  it('creates a distinct account on every call', async () => {
    const [first, second] = await Promise.all([
      registerUnverifiedUser(),
      registerUnverifiedUser(),
    ])

    expect(second.id).not.toBe(first.id)
  })
})
