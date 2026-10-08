import { faker } from '@faker-js/faker/locale/th'
import { afterEach, describe, vi } from 'vitest'
import { abandonActionCommitment } from '../abandon-action-commitment'

const { abandonActionCommitment: abandonActionCommitmentCoreServiceMock } =
  vi.hoisted(() => ({
    abandonActionCommitment: vi.fn(),
  }))
vi.mock(
  '@nosgestesclimat/core/features/actions/services/abandon-action-commitment.service',
  () => ({ abandonActionCommitment: abandonActionCommitmentCoreServiceMock })
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

describe('abandonActionCommitment service', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should call unauthorized() if no user session is found', async () => {
    sessionMock.getUserSession.mockResolvedValue(null)

    await expect(
      abandonActionCommitment({
        actionId: faker.string.uuid(),
        actionSlug: faker.string.uuid(),
      })
    ).rejects.toThrow('NEXT_UNAUTHORIZED')

    expect(unauthorizedMock).toHaveBeenCalledTimes(1)
    expect(abandonActionCommitmentCoreServiceMock).not.toHaveBeenCalled()
  })

  it("should return before updating the cache if the service call result isn't a success", async () => {
    sessionMock.getUserSession.mockResolvedValue(mockUser)

    abandonActionCommitmentCoreServiceMock.mockRejectedValue('db error')

    await expect(
      abandonActionCommitment({
        actionId: faker.string.uuid(),
        actionSlug: faker.string.uuid(),
      })
    ).rejects.toThrow()

    expect(updateTagMock).not.toHaveBeenCalled()
  })

  it('should update the actions list and the action detail caches if the service call result is a success', async () => {
    sessionMock.getUserSession.mockResolvedValue(mockUser)

    await expect(
      abandonActionCommitment({
        actionId: faker.string.uuid(),
        actionSlug: faker.string.uuid(),
      })
    ).resolves.toBeUndefined()

    expect(updateTagMock).toHaveBeenCalledTimes(2)
  })
})
