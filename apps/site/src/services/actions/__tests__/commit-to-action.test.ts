import { faker } from '@faker-js/faker/locale/th'
import { commitToAction } from '@nosgestesclimat/core/features/actions/services/commit-to-action.service'
import { afterEach, describe, vi } from 'vitest'

const { commitToAction: commitToActionCoreServiceMock } = vi.hoisted(() => ({
  commitToAction: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/actions/services/commit-to-action.service',
  () => ({ commitToAction: commitToActionCoreServiceMock })
)

describe('commitToAction service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call the commitToAction from the @core package', async () => {
    await commitToAction({
      actionId: faker.string.uuid(),
      userId: faker.string.uuid(),
    })
    expect(commitToActionCoreServiceMock).toHaveBeenCalled()
  })
})
