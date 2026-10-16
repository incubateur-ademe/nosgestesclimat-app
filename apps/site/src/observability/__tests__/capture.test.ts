// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { captureException, getClient, init, posthogCapture } = vi.hoisted(
  () => ({
    captureException: vi.fn(),
    getClient: vi.fn(),
    init: vi.fn(),
    posthogCapture: vi.fn(),
  })
)

vi.mock('@sentry/node', () => ({
  captureException,
  getClient,
  init,
}))
vi.mock('../../services/tracking/posthogServer.ts', () => ({
  posthogClient: { captureException: posthogCapture },
}))

import { captureException as capture, initErrorCapture } from '../capture.ts'

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

describe('initErrorCapture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('wires Sentry once', () => {
    getClient.mockReturnValue(undefined)

    initErrorCapture({ dsn: 'https://sentry.test/1' })
    expect(init).toHaveBeenCalledTimes(1)

    // A process that dies after its wiring: Sentry is already there.
    getClient.mockReturnValue({})
    initErrorCapture({ dsn: undefined })
    expect(init).toHaveBeenCalledTimes(1)
  })
})
