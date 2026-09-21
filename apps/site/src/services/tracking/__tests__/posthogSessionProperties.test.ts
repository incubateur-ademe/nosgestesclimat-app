import { beforeEach, describe, expect, it, vi } from 'vitest'

const posthogMock = vi.hoisted(() => ({
  register_for_session: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: posthogMock }))

describe('posthogSessionProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // The registry is module-level state, so re-import the module for a clean slate
    vi.resetModules()
  })

  it('forwards the properties to the SDK session persistence', async () => {
    const { registerSessionProperties } =
      await import('../posthogSessionProperties')

    registerSessionProperties({ locale: 'fr' })

    expect(posthogMock.register_for_session).toHaveBeenCalledWith({
      locale: 'fr',
    })
  })

  it('replays every property registered so far, merged', async () => {
    const { registerSessionProperties, reapplySessionProperties } =
      await import('../posthogSessionProperties')

    // ClientTrackers then PollTracker, as mounted by the layout + campaign page
    registerSessionProperties({ locale: 'fr' })
    registerSessionProperties({ organisation: 'orga', poll: 'poll' })
    posthogMock.register_for_session.mockClear()

    reapplySessionProperties()

    expect(posthogMock.register_for_session).toHaveBeenCalledTimes(1)
    expect(posthogMock.register_for_session).toHaveBeenCalledWith({
      locale: 'fr',
      organisation: 'orga',
      poll: 'poll',
    })
  })

  it('lets the last registration win for a given property', async () => {
    const { registerSessionProperties, reapplySessionProperties } =
      await import('../posthogSessionProperties')

    registerSessionProperties({ locale: 'fr', region: 'FR' })
    registerSessionProperties({ locale: 'en' })
    posthogMock.register_for_session.mockClear()

    reapplySessionProperties()

    expect(posthogMock.register_for_session).toHaveBeenCalledWith({
      locale: 'en',
      region: 'FR',
    })
  })

  it('does nothing when no property was ever registered', async () => {
    const { reapplySessionProperties } =
      await import('../posthogSessionProperties')

    reapplySessionProperties()

    expect(posthogMock.register_for_session).not.toHaveBeenCalled()
  })
})
