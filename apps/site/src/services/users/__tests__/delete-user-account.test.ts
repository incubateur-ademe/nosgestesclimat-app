import { getUserSession } from '@/services/auth/get-user-session'
import { logout } from '@/services/auth/logout'
import { faker } from '@faker-js/faker'
import { deleteUser } from '@nosgestesclimat/core/features/users/services/delete-user.service'
import { describe, it, vi } from 'vitest'
import { deleteUserAccount } from '../delete-user-account'

describe('deleteUserAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`)
    })
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
  it('should logout after a successful account deletion', async () => {
    vi.mocked(getUserSession).mockResolvedValue({
      id: faker.string.uuid(),
      isAuth: true,
      email: faker.internet.email(),
    })
    vi.mocked(deleteUser).mockImplementation(
      async () => await Promise.resolve(undefined)
    )
    vi.mocked(logout).mockImplementation(
      async () => await Promise.resolve(undefined)
    )

    await expect(deleteUserAccount()).rejects.toThrow('REDIRECT:/')

    expect(logoutMock).toHaveBeenCalledTimes(1)
  })
  it('should redirect to the home page after a successful account deletion', async () => {
    vi.mocked(getUserSession).mockResolvedValue({
      id: faker.string.uuid(),
      isAuth: true,
      email: faker.internet.email(),
    })
    vi.mocked(deleteUser).mockImplementation(
      async () => await Promise.resolve(undefined)
    )

    await expect(deleteUserAccount()).rejects.toThrow('REDIRECT:/')

    expect(redirectMock).toHaveBeenCalledTimes(1)
    expect(redirectMock).toHaveBeenCalledWith('/')
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

const redirectMock = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({
  unauthorized: () => {
    throw new Error('UNAUTHORIZED')
  },
  forbidden: () => {
    throw new Error('FORBIDDEN')
  },
  redirect: redirectMock,
}))

vi.mock(
  '@nosgestesclimat/core/features/users/services/delete-user.service',
  () => ({
    deleteUser: vi.fn(),
  })
)

const logoutMock = vi.hoisted(() => vi.fn())
vi.mock('@/services/auth/logout', () => ({
  logout: logoutMock,
}))
