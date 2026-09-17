import { FF_COOKIE_NAME } from '@/services/feature-flags/constants'
import type { FeatureFlagsCallback } from 'posthog-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FLAGS_TIMEOUT_MS } from '../experimentExposure'

const FLAG = 'abc-test-layout-catalogue'

const posthogMock = vi.hoisted(() => ({
  featureFlags: { hasLoadedFlags: false } as
    | { hasLoadedFlags: boolean }
    | undefined,
  onFeatureFlags: vi.fn<(callback: FeatureFlagsCallback) => () => void>(),
  getFeatureFlag: vi.fn(),
  captureException: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: posthogMock }))

/** Re-imported per test: the readiness promise is cached at module scope. */
async function importSubject() {
  vi.resetModules()
  return await import('../experimentExposure')
}

/** Runs the callbacks registered through `onFeatureFlags`, as PostHog would. */
function loadFlags() {
  for (const [callback] of posthogMock.onFeatureFlags.mock.calls) {
    callback([FLAG], { [FLAG]: 'test-fond-blanc' }, { errorsLoading: false })
  }
}

describe('whenExperimentsResolved', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    posthogMock.featureFlags = { hasLoadedFlags: false }
    posthogMock.onFeatureFlags.mockReset().mockReturnValue(vi.fn())
    posthogMock.getFeatureFlag.mockReset().mockReturnValue('test-fond-blanc')
    document.cookie = `${FF_COOKIE_NAME}=; max-age=0`
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not resolve, nor expose, while the flags are still loading', async () => {
    const { whenExperimentsResolved } = await importSubject()
    const onResolved = vi.fn()

    void whenExperimentsResolved([FLAG]).then(onResolved)
    await vi.advanceTimersByTimeAsync(2_000)

    expect(onResolved).not.toHaveBeenCalled()
    expect(posthogMock.getFeatureFlag).not.toHaveBeenCalled()
  })

  it('emits the exposure as soon as the flags land', async () => {
    const { whenExperimentsResolved } = await importSubject()
    const pending = whenExperimentsResolved([FLAG])

    loadFlags()
    await pending

    expect(posthogMock.getFeatureFlag).toHaveBeenCalledWith(FLAG)
  })

  it('resolves without waiting when the flags are already loaded', async () => {
    posthogMock.featureFlags = { hasLoadedFlags: true }
    const { whenExperimentsResolved } = await importSubject()

    await whenExperimentsResolved([FLAG])

    expect(posthogMock.onFeatureFlags).not.toHaveBeenCalled()
    expect(posthogMock.getFeatureFlag).toHaveBeenCalledWith(FLAG)
  })

  it('gives up waiting after the timeout so events are never lost', async () => {
    const { whenExperimentsResolved } = await importSubject()
    const onResolved = vi.fn()

    void whenExperimentsResolved([FLAG]).then(onResolved)
    await vi.advanceTimersByTimeAsync(FLAGS_TIMEOUT_MS)

    expect(onResolved).toHaveBeenCalled()
  })

  it('waits only once, then reuses the resolved state', async () => {
    const { whenExperimentsResolved } = await importSubject()

    const pending = whenExperimentsResolved([FLAG])
    loadFlags()
    await pending
    await whenExperimentsResolved([FLAG])

    expect(posthogMock.onFeatureFlags).toHaveBeenCalledOnce()
    expect(posthogMock.getFeatureFlag).toHaveBeenCalledTimes(2)
  })

  it('stops listening once the flags have landed, and drops the pending timeout', async () => {
    const unsubscribe = vi.fn()
    posthogMock.onFeatureFlags.mockReturnValue(unsubscribe)
    const { whenExperimentsResolved } = await importSubject()

    const pending = whenExperimentsResolved([FLAG])
    loadFlags()
    await pending

    // An uncancelled timeout would settle a second time, unsubscribing twice.
    await vi.advanceTimersByTimeAsync(FLAGS_TIMEOUT_MS)

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('stops listening when it gives up waiting', async () => {
    const unsubscribe = vi.fn()
    posthogMock.onFeatureFlags.mockReturnValue(unsubscribe)
    const { whenExperimentsResolved } = await importSubject()

    void whenExperimentsResolved([FLAG])
    await vi.advanceTimersByTimeAsync(FLAGS_TIMEOUT_MS)

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('unsubscribes even when PostHog calls back synchronously', async () => {
    const unsubscribe = vi.fn()
    posthogMock.onFeatureFlags.mockImplementation((callback) => {
      callback([FLAG], { [FLAG]: 'test-fond-blanc' }, { errorsLoading: false })
      return unsubscribe
    })
    const { whenExperimentsResolved } = await importSubject()

    await whenExperimentsResolved([FLAG])

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('still resolves when PostHog was never initialised', async () => {
    // `posthog.featureFlags` only exists once `init()` has run, which it may
    // not have — in an iframe that never came into view, say. PostHog then
    // invokes the callback synchronously with `errorsLoading`.
    const unsubscribe = vi.fn()
    posthogMock.featureFlags = undefined
    posthogMock.onFeatureFlags.mockImplementation((callback) => {
      callback([], {}, { errorsLoading: true })
      return unsubscribe
    })
    const { whenExperimentsResolved } = await importSubject()

    await expect(whenExperimentsResolved([FLAG])).resolves.toBeUndefined()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('skips PostHog for an overridden flag, keeping the session out of the experiment', async () => {
    document.cookie = `${FF_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({ [FLAG]: 'test-fond-bleu' })
    )}`
    posthogMock.featureFlags = { hasLoadedFlags: true }
    const { whenExperimentsResolved } = await importSubject()

    await whenExperimentsResolved([FLAG])

    expect(posthogMock.getFeatureFlag).not.toHaveBeenCalled()
  })
})
