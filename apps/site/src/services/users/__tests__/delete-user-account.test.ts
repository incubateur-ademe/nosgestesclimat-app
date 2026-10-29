import { serverLoggerMock } from '@/helpers/tests/mockLogger'
import { getUserSession } from '@/services/auth/get-user-session'
import { faker } from '@faker-js/faker'
import { deleteUser } from '@nosgestesclimat/core/features/users/services/delete-user.service'
import { describe, it, vi } from 'vitest'
import { deleteUserAccount } from '../delete-user-account'

describe('deleteUserAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('should throw an unauthorized error if no user session exists', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    await expect(deleteUserAccount()).rejects.toThrow('UNAUTHORIZED')
  })
  it('should throw a forbidden error if the user session is not authenticated', async () => {
    vi.mocked(getUserSession).mockResolvedValue({
      id: faker.string.uuid(),
      isAuth: false,
    })

    await expect(deleteUserAccount()).rejects.toThrow('FORBIDDEN')
  })
  it('deletes the user account', async () => {
    const userId = faker.string.uuid()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      isAuth: true,
      email: faker.internet.email(),
    })
    vi.mocked(deleteUser).mockImplementation(
      async () => await Promise.resolve(undefined)
    )

    await expect(deleteUserAccount()).resolves.toBeUndefined()
    expect(deleteUser).toHaveBeenCalledWith(userId)
  })
  it('should propagate the error in case of a server error', async () => {
    vi.mocked(getUserSession).mockResolvedValue({
      id: faker.string.uuid(),
      isAuth: true,
      email: faker.internet.email(),
    })
    vi.mocked(deleteUser).mockImplementation(() => {
      throw new Error('Boom')
    })

    await expect(deleteUserAccount()).rejects.toThrow('Boom')
  })
})

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock('@/logger/logger.server', () => ({ default: serverLoggerMock }))

vi.mock('next/navigation', () => ({
  unauthorized: () => {
    throw new Error('UNAUTHORIZED')
  },
  forbidden: () => {
    throw new Error('FORBIDDEN')
  },
}))

vi.mock(
  '@nosgestesclimat/core/features/users/services/delete-user.service',
  () => ({
    deleteUser: vi.fn(),
  })
)
