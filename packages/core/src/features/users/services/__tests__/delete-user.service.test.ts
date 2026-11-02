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
import { createBrevoClient } from '../../../emails/brevo/client.ts'
import { Attributes } from '../../../emails/email.constant.ts'
import { groupFactory } from '../../../groups/factories/group.factory.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { findUserById } from '../../repositories/users.repository.ts'
import { createDeleteUser } from '../delete-user.service.ts'

const logger = createTestLogger()
const sendEmail = vi.fn().mockResolvedValue(success())
const addOrUpdateContact = vi.fn().mockResolvedValue(success())
const resetUserProperties = vi.fn().mockResolvedValue(success())
const origin = 'https://nosgestesclimat.test'

describe('deleteUser', () => {
  const deleteUser = createDeleteUser({ resetUserProperties })
  const login = createLogin({
    logger,
    sendEmail,
    addOrUpdateContact,
    origin,
    backgroundTaskRunner: () => {},
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
    resetUserProperties.mockClear()
    vi.unstubAllGlobals()
  })

  it('marks the user as deleted and keeps their entities', async () => {
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

    await deleteUser(user.id)

    const deletedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    })
    expect(deletedUser).toMatchObject({
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

  it('clears the Brevo attributes of the deleted account', async () => {
    const user = await userFactory.verified().create()

    await deleteUser(user.id)

    expect(resetUserProperties).toHaveBeenCalledExactlyOnceWith({
      email: user.email,
    })
  })

  it('sends every known Brevo attribute as null for the deleted account', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const brevoClient = createBrevoClient({
      url: 'https://brevo.test',
      apiKey: 'test-api-key',
    })
    const deleteUserWithBrevo = createDeleteUser({
      resetUserProperties: brevoClient.resetUserProperties,
    })

    const user = await userFactory.verified().create()

    await deleteUserWithBrevo(user.id)

    expect(fetchMock).toHaveBeenCalledOnce()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]

    expect(url).toBe(
      `https://brevo.test/v3/contacts/${encodeURIComponent(user.email)}`
    )
    expect(init.method).toBe('PUT')
    // A null value is how Brevo clears an attribute, whatever its type.
    expect(JSON.parse(init.body as string)).toEqual({
      attributes: Object.fromEntries(
        Object.values(Attributes).map((attribute) => [attribute, null])
      ),
    })
  })

  it('starts a new identity when a deleted account signs up with the same email', async () => {
    const deletedUser = await userFactory
      .verified()
      .create({ name: faker.person.fullName() })
    const { email } = deletedUser
    await groupFactory.withAdministrator(deletedUser.id).create()
    await groupFactory.withParticipant({ userId: deletedUser.id }).create()

    await deleteUser(deletedUser.id)

    const verificationCode = await verificationCodeFactory.create({ email })
    const result = await login({
      email,
      code: verificationCode.code,
      locale: 'fr',
      intent: 'create-account',
    })

    expect.assert(result.success)
    expect(result.data.mode).toBe('signUp')
    expect(result.data.user.id).not.toBe(deletedUser.id)
    expect(result.data.user.name).toBeNull()
    expect(
      await prisma.groupAdministrator.count({
        where: { userId: result.data.user.id },
      })
    ).toBe(0)
    expect(
      await prisma.groupAdministrator.count({
        where: { userId: deletedUser.id },
      })
    ).toBe(1)
    expect(
      await prisma.groupParticipant.count({
        where: { userId: result.data.user.id },
      })
    ).toBe(0)
    expect(
      await prisma.groupParticipant.count({
        where: { userId: deletedUser.id },
      })
    ).toBe(1)
  })

  it('fails silently when deleting an unknown user', async () => {
    await expect(deleteUser(faker.string.uuid())).resolves.toBeUndefined()
    expect(resetUserProperties).not.toHaveBeenCalled()
  })
})
