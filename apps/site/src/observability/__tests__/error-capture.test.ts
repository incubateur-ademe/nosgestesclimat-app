// @vitest-environment node
import type * as OtelApi from '@opentelemetry/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { captureException, currentRequestIdentity, getSpan } = vi.hoisted(
  () => ({
    captureException: vi.fn(),
    currentRequestIdentity: vi.fn(),
    getSpan: vi.fn(),
  })
)

vi.mock('../../services/tracking/posthogServer.ts', () => ({
  posthogClient: { captureException },
}))
vi.mock('../request-identity.ts', () => ({ currentRequestIdentity }))
vi.mock('@opentelemetry/api', async (importOriginal) => ({
  // Only the lookup is stubbed: the validity rule stays the API's own.
  ...(await importOriginal<typeof OtelApi>()),
  trace: { getSpan },
}))

import { captureToPostHog } from '../error-capture.ts'

describe('captureToPostHog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // No span unless a test asks for one: outside a request, an error has none.
    getSpan.mockReturnValue(undefined)
  })

  it('files the error on the person and the session of its request', () => {
    currentRequestIdentity.mockReturnValue({
      distinctId: 'user-1',
      sessionId: 'replay-1',
    })

    const error = new Error('brevo is down')
    captureToPostHog(error)

    // `$session_id` is PostHog's own key for the replay link: an event without
    // it is a dead end from the issue.
    expect(captureException).toHaveBeenCalledWith(error, 'user-1', {
      $session_id: 'replay-1',
    })
  })

  it('carries the line the error was reported with', () => {
    currentRequestIdentity.mockReturnValue({ distinctId: 'user-1' })

    captureToPostHog(new Error('render failed'), {
      'http.route': '/[locale]/fin/eau',
      'ngc.scope': 'site.instrumentation.onRequestError',
    })

    // The line as the logger built it for the capture: `$exception_list`
    // renders the error itself, so the event carries the request context.
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), 'user-1', {
      'http.route': '/[locale]/fin/eau',
      'ngc.scope': 'site.instrumentation.onRequestError',
    })
  })

  it('carries the ids of the span the request runs in', () => {
    currentRequestIdentity.mockReturnValue({ distinctId: 'user-1' })
    getSpan.mockReturnValue({
      spanContext: () => ({
        traceId: 'a'.repeat(32),
        spanId: 'b'.repeat(16),
      }),
    })

    captureToPostHog(new Error('render failed'))

    // Hexadecimal, the form the app displays and a reader copies.
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), 'user-1', {
      trace_id: 'a'.repeat(32),
      span_id: 'b'.repeat(16),
    })
  })

  it('leaves out an inactive span, whose ids are zeros', () => {
    currentRequestIdentity.mockReturnValue({ distinctId: 'user-1' })
    getSpan.mockReturnValue({
      spanContext: () => ({
        traceId: '0'.repeat(32),
        spanId: '0'.repeat(16),
      }),
    })

    captureToPostHog(new Error('job failed'))

    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      'user-1',
      {}
    )
  })

  it('sends no session rather than an empty one', () => {
    currentRequestIdentity.mockReturnValue({ distinctId: 'user-1' })

    captureToPostHog(new Error('job failed'))

    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      'user-1',
      {}
    )
  })

  it('reports an error no request carries, which the SDK files anonymously', () => {
    currentRequestIdentity.mockReturnValue(undefined)

    captureToPostHog(new Error('crash'))

    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      undefined,
      {}
    )
  })
})
