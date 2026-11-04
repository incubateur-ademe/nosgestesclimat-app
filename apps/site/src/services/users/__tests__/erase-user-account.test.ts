import { serverLoggerMock } from '@/helpers/tests/mockLogger'
import { getUserSession } from '@/services/auth/get-user-session'
import { faker } from '@faker-js/faker'
import { describe, it, vi } from 'vitest'
import { eraseUserAccount } from '../erase-user-account'

const { eraseUserMock } = vi.hoisted(() => ({
  eraseUserMock: vi.fn(),
}))

describe('eraseUserAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('should throw an unauthorized error if no user session exists', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    await expect(eraseUserAccount()).rejects.toThrow('UNAUTHORIZED')
  })
  it('should throw a forbidden error if the user session is not authenticated', async () => {
    vi.mocked(getUserSession).mockResolvedValue({
      id: faker.string.uuid(),
      isAuth: false,
    })

    await expect(eraseUserAccount()).rejects.toThrow('FORBIDDEN')
  })
  it('erases the user account', async () => {
    const userId = faker.string.uuid()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      isAuth: true,
      email: faker.internet.email(),
    })
    eraseUserMock.mockResolvedValueOnce(undefined)

    await expect(eraseUserAccount()).resolves.toBeUndefined()
    expect(eraseUserMock).toHaveBeenCalledWith(userId)
  })
  it('should propagate the error in case of a server error', async () => {
    vi.mocked(getUserSession).mockResolvedValue({
      id: faker.string.uuid(),
      isAuth: true,
      email: faker.internet.email(),
    })
    eraseUserMock.mockRejectedValueOnce(new Error('Boom'))

    await expect(eraseUserAccount()).rejects.toThrow('Boom')
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
  '@nosgestesclimat/core/features/users/services/erase-user.service',
  () => ({ eraseUser: eraseUserMock })
)
