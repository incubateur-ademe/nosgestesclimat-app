// @vitest-environment node
import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  captureException,
  flush: sentryFlush,
  init,
  posthogCapture,
  posthogShutdown,
  readServerEnv,
  shutdownOtel,
} = vi.hoisted(() => ({
  captureException: vi.fn(),
  flush: vi.fn(),
  init: vi.fn(),
  posthogCapture: vi.fn(),
  posthogShutdown: vi.fn(),
  readServerEnv: vi.fn(),
  shutdownOtel: vi.fn(),
}))

vi.mock('@sentry/node', () => ({
  captureException,
  flush: sentryFlush,
  init,
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

  it('reports to both, with the line the error was reported with', () => {
    capture(error, { userId: 'user-1' })

    expect(captureException).toHaveBeenCalledWith(error, {
      extra: { userId: 'user-1' },
    })
    expect(posthogCapture).toHaveBeenCalled()
  })
})

describe('wireProcessObservability', () => {
  let onProcess: MockInstance

  beforeEach(() => {
    vi.clearAllMocks()
    // The handlers stay out of the runner's process: none runs in this file.
    onProcess = vi.spyOn(process, 'on').mockImplementation(() => process)
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.test/1'
    readServerEnv.mockImplementation(() => ({
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test',
      POSTHOG_OTLP_ENDPOINT: 'https://otlp.test',
    }))
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
  })

  it('starts the Sentry client from the raw variable', () => {
    wireProcessObservability('worker')

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://sentry.test/1' })
    )
  })

  it('registers the handlers and the client before the contract fails', () => {
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
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://sentry.test/1' })
    )
  })
})

describe('flushObservability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends what the three reporters hold', async () => {
    await flushObservability()

    expect(sentryFlush).toHaveBeenCalled()
    expect(posthogShutdown).toHaveBeenCalled()
    expect(shutdownOtel).toHaveBeenCalled()
  })
})
