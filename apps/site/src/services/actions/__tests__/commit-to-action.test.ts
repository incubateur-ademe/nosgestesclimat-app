import { faker } from '@faker-js/faker/locale/th'
import { afterEach, describe, vi } from 'vitest'
import { commitToAction } from '../commit-to-action'

const { commitToAction: commitToActionCoreServiceMock } = vi.hoisted(() => ({
  commitToAction: vi.fn(),
}))
vi.mock(
  '@nosgestesclimat/core/features/actions/services/commit-to-action.service',
  () => ({ commitToAction: commitToActionCoreServiceMock })
)

const { unauthorized: unauthorizedMock } = vi.hoisted(() => ({
  unauthorized: vi.fn(() => {
    throw new Error('NEXT_UNAUTHORIZED')
  }),
}))
vi.mock('next/navigation', () => ({ unauthorized: unauthorizedMock }))

const sessionMock = vi.hoisted(() => ({
  getUserSession: vi.fn(),
}))
vi.mock('../../auth/get-user-session', () => ({
  getUserSession: sessionMock.getUserSession,
}))

const { updateTag: updateTagMock } = vi.hoisted(() => ({
  updateTag: vi.fn(),
}))
vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
}))

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve(new Map([['x-next-i18n-router-locale', 'fr']])),
  cookies: () => Promise.resolve(new Map()),
}))

const mockUser = {
  id: faker.string.uuid(),
  email: faker.internet.email(),
  auth: false,
}

describe('commitToAction service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call unauthorized() if no user session is found', async () => {
    sessionMock.getUserSession.mockResolvedValue(null)

    await expect(commitToAction(faker.string.uuid())).rejects.toThrow(
      'NEXT_UNAUTHORIZED'
    )

    expect(unauthorizedMock).toHaveBeenCalledTimes(1)
    expect(commitToActionCoreServiceMock).not.toHaveBeenCalled()
  })

  it("should return before updating the cache if the service call result isn't a success", async () => {
    sessionMock.getUserSession.mockResolvedValue(mockUser)
    const errorResult = {
      success: false,
    }
    commitToActionCoreServiceMock.mockResolvedValue(errorResult)

    const result = await commitToAction(faker.string.uuid())

    expect(result).toEqual(errorResult)
    expect(updateTagMock).not.toHaveBeenCalled()
  })

  it('should update the cache if the service call result is a success', async () => {
    sessionMock.getUserSession.mockResolvedValue(mockUser)
    const successResult = {
      success: true,
    }
    commitToActionCoreServiceMock.mockResolvedValue(successResult)

    const result = await commitToAction(faker.string.uuid())

    expect(result).toEqual(successResult)
    expect(updateTagMock).toHaveBeenCalledTimes(1)
  })
})
