// @vitest-environment node
import type { MockInstance } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { posthogCapture, posthogShutdown, readServerEnv, shutdownOtel } =
  vi.hoisted(() => ({
    posthogCapture: vi.fn(),
    posthogShutdown: vi.fn(),
    readServerEnv: vi.fn(),
    shutdownOtel: vi.fn(),
  }))

vi.mock('../../services/tracking/posthogServer.ts', () => ({
  posthogClient: {
    captureException: posthogCapture,
    shutdown: posthogShutdown,
  },
}))
vi.mock('../../env/server-contract.ts', () => ({ readServerEnv }))
// Only the shutdown is exercised: `appTracer` is imported by `logger.node.ts`.
vi.mock('../otel.ts', () => ({
  initOtel: vi.fn(),
  shutdownOtel,
  appTracer: vi.fn(),
}))

import {
  captureException as capture,
  flushObservability,
  wireProcessObservability,
} from '../process.ts'

const error = new Error('brevo is down')

describe('captureException', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports to PostHog with the line the error was reported with', () => {
    capture(error, { userId: 'user-1' })

    expect(posthogCapture).toHaveBeenCalled()
  })
})

describe('wireProcessObservability', () => {
  let onProcess: MockInstance

  beforeEach(() => {
    vi.clearAllMocks()
    // The handlers stay out of the runner's process: none runs in this file.
    onProcess = vi.spyOn(process, 'on').mockImplementation(() => process)
    readServerEnv.mockImplementation(() => ({
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test',
      POSTHOG_OTLP_ENDPOINT: 'https://otlp.test',
    }))
  })

  it('registers the handlers before the contract fails', () => {
    readServerEnv.mockImplementation(() => {
      throw new Error('invalid environment')
    })

    expect(() => wireProcessObservability('worker')).toThrow(
      'invalid environment'
    )

    expect(onProcess).toHaveBeenCalledWith(
      'uncaughtException',
      expect.any(Function)
    )
  })
})

describe('flushObservability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends what the two reporters hold', async () => {
    await flushObservability()

    expect(posthogShutdown).toHaveBeenCalled()
    expect(shutdownOtel).toHaveBeenCalled()
  })
})
