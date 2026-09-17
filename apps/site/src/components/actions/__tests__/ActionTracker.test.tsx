import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { render, waitFor } from '@testing-library/react'
import type { FeatureFlagsCallback } from 'posthog-js'
import { describe, expect, it, vi } from 'vitest'
import ActionTracker from '../ActionTracker'

const FLAG = 'abc-test-layout-catalogue'

const posthogMock = vi.hoisted(() => ({
  featureFlags: { hasLoadedFlags: false },
  onFeatureFlags: vi.fn<(callback: FeatureFlagsCallback) => () => void>(() =>
    vi.fn()
  ),
  getFeatureFlag: vi.fn(() => 'test-fond-blanc'),
  capture: vi.fn(),
  captureException: vi.fn(),
  get_session_id: vi.fn(() => 'session-id'),
}))

vi.mock('posthog-js', () => ({ default: posthogMock }))

const captureExceptionMock = vi.hoisted(() => vi.fn())

vi.mock('@sentry/nextjs', () => ({ captureException: captureExceptionMock }))

const action = {
  trackingId: 'chauffage',
  theme: { trackingId: 'logement' },
  assessment: { impact: 120 },
} as MaybePersonalizedAction

/** Runs the callbacks registered through `onFeatureFlags`, as PostHog would. */
function loadFlags() {
  for (const [callback] of posthogMock.onFeatureFlags.mock.calls) {
    callback([FLAG], { [FLAG]: 'test-fond-blanc' }, { errorsLoading: false })
  }
}

describe('ActionTracker', () => {
  // Readiness is cached for the lifetime of the module, so the first case has
  // to assert the whole sequence in one render, and the cases below run against
  // an already-settled one. The readiness rules themselves are covered in
  // `experimentExposure.test.ts`.
  it('captures the event only once the experiment has been read, so it counts towards it', async () => {
    render(<ActionTracker eventName="displayed" action={action} />)

    expect(posthogMock.capture).not.toHaveBeenCalled()

    loadFlags()
    await waitFor(() => expect(posthogMock.capture).toHaveBeenCalled())

    expect(posthogMock.capture).toHaveBeenCalledWith(
      'action displayed',
      expect.objectContaining({ action_name: 'chauffage' }),
      undefined
    )
    expect(posthogMock.getFeatureFlag.mock.invocationCallOrder[0]).toBeLessThan(
      posthogMock.capture.mock.invocationCallOrder[0]
    )
  })

  it('still captures when the exposure fails, losing only the attribution', async () => {
    posthogMock.capture.mockClear()
    posthogMock.getFeatureFlag.mockImplementationOnce(() => {
      throw new Error('PostHog unavailable')
    })

    render(
      <ActionTracker
        eventName="displayed"
        action={{ ...action, trackingId: 'alimentation' } as typeof action}
      />
    )
    loadFlags()

    await waitFor(() => expect(posthogMock.capture).toHaveBeenCalled())
    expect(posthogMock.capture).toHaveBeenCalledWith(
      'action displayed',
      expect.objectContaining({ action_name: 'alimentation' }),
      undefined
    )
    expect(captureExceptionMock).toHaveBeenCalledOnce()
  })
})
