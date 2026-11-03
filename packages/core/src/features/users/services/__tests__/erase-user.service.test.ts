import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { refreshTokenFactory } from '../../../auth/factories/refresh-token.factory.ts'
import { verificationCodeFactory } from '../../../auth/factories/verification-code.factory.ts'
import { findAllRefreshTokenByUserId } from '../../../auth/repositories/refresh-token.repository.ts'
import { createLogin } from '../../../auth/services/login.service.ts'
import { groupFactory } from '../../../groups/factories/group.factory.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { findUserById } from '../../repositories/users.repository.ts'
import { eraseUser } from '../erase-user.service.ts'

const logger = createTestLogger()
const sendEmail = vi.fn().mockResolvedValue(success())
const addOrUpdateContact = vi.fn().mockResolvedValue(success())
const origin = 'https://nosgestesclimat.test'

describe('eraseUser', () => {
  const login = createLogin({
    logger,
    sendEmail,
    addOrUpdateContact,
    origin,
    backgroundTaskRunner: () => {},
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('erases the account and keeps its entities', async () => {
    const user = await userFactory
      .verified()
      .create({ name: faker.person.fullName() })
    const { email } = user
    await organisationFactory.withAdministrator(user).create()
    await refreshTokenFactory.params({ userId: user.id }).create()
    await simulationFactory.params({ userId: user.id }).completed().create()
    await groupFactory.withAdministrator(user.id).create()
    await groupFactory.withParticipant({ userId: user.id }).create()
    const simulationCount = await prisma.simulation.count({
      where: { userId: user.id },
    })

    await eraseUser(user.id)

    const erasedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    })
    expect(erasedUser).toMatchObject({
      deletedAt: expect.any(Date),
      email: null,
      name: null,
    })
    expect(await findUserById(user.id)).toBeNull()
    expect(
      await prisma.verifiedUser.findFirst({ where: { id: user.id } })
    ).toBeNull()
    expect(
      await prisma.organisationAdministrator.findFirst({
        where: { userEmail: email },
      })
    ).toBeNull()
    expect(await findAllRefreshTokenByUserId(user.id)).toEqual([])
    expect(await prisma.simulation.count({ where: { userId: user.id } })).toBe(
      simulationCount
    )
    expect(
      await prisma.groupAdministrator.count({ where: { userId: user.id } })
    ).toBe(1)
    expect(
      await prisma.groupParticipant.count({ where: { userId: user.id } })
    ).toBe(1)
  })

  it('starts a new identity when an erased account signs up with the same email', async () => {
    const erasedUser = await userFactory
      .verified()
      .create({ name: faker.person.fullName() })
    const { email } = erasedUser
    await groupFactory.withAdministrator(erasedUser.id).create()
    await groupFactory.withParticipant({ userId: erasedUser.id }).create()

    await eraseUser(erasedUser.id)

    const verificationCode = await verificationCodeFactory.create({ email })
    const result = await login({
      email,
      code: verificationCode.code,
      locale: 'fr',
      intent: 'create-account',
    })

    expect.assert(result.success)
    expect(result.data.mode).toBe('signUp')
    expect(result.data.user.id).not.toBe(erasedUser.id)
    expect(result.data.user.name).toBeNull()
    expect(
      await prisma.groupAdministrator.count({
        where: { userId: result.data.user.id },
      })
    ).toBe(0)
    expect(
      await prisma.groupAdministrator.count({
        where: { userId: erasedUser.id },
      })
    ).toBe(1)
    expect(
      await prisma.groupParticipant.count({
        where: { userId: result.data.user.id },
      })
    ).toBe(0)
    expect(
      await prisma.groupParticipant.count({
        where: { userId: erasedUser.id },
      })
    ).toBe(1)
  })

  it('fails silently when erasing an unknown user', async () => {
    await expect(eraseUser(faker.string.uuid())).resolves.toBeUndefined()
  })
})
