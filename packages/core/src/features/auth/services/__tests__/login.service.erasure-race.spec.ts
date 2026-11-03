import { afterEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import type { Transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import type * as UsersRepository from '../../../users/repositories/users.repository.ts'
import { verificationCodeFactory } from '../../factories/verification-code.factory.ts'
import { createLogin } from '../login.service.ts'

vi.mock(
  '../../../users/repositories/users.repository.ts',
  async (importOriginal) => {
    const actual = await importOriginal<typeof UsersRepository>()

    return {
      ...actual,
      // The erasure commits between the session user's read and the sign-up's
      // write: the window the sign-up has to absorb.
      findUserById: async (
        id: string,
        options: { session?: Transaction } = {}
      ) => {
        const user = await actual.findUserById(id, options)
        if (user) await actual.deleteUser(id, options)
        return user
      },
    }
  }
)

vi.mock('../../../users/services/sync-user-data.service.ts', () => ({
  createSyncUserData: () => vi.fn(),
}))

vi.mock(
  '../../../users/services/reconcile-simulations-after-login.service.ts',
  () => ({ createReconcileSimulationsAfterLogin: () => vi.fn() })
)

describe('Given the session user is erased while the login runs', () => {
  const login = createLogin({
    logger: createTestLogger(),
    sendEmail: vi.fn().mockResolvedValue(success()),
    addOrUpdateContact: vi.fn().mockResolvedValue(success()),
    origin: 'https://nosgestesclimat.test',
    backgroundTaskRunner: () => {},
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('signs the user up with a fresh identity instead of failing', async () => {
    const sessionUser = await userFactory.create()
    const verificationCode = await verificationCodeFactory.create()

    const result = await login({
      email: verificationCode.email,
      code: verificationCode.code,
      locale: 'fr',
      intent: 'create-account',
      sessionUserId: sessionUser.id,
    })

    // The race did happen: the erasure landed after the session user's read.
    const erasedUser = await prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
    })
    expect(erasedUser.deletedAt).toBeInstanceOf(Date)

    expect.assert(result.success)
    expect(result.data.mode).toBe('signUp')
    expect(result.data.user.id).not.toBe(sessionUser.id)
  })
})
