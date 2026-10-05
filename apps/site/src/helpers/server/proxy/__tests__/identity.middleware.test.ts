// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { identifyRequest } from '@/observability/request-identity'

import { middlewareIdentity } from '../identity.middleware'

vi.mock('@/observability/request-identity', () => ({
  identifyRequest: vi.fn(),
}))

const identified = vi.mocked(identifyRequest)

const request = (headers: Record<string, string>) =>
  new NextRequest('http://localhost/fr', { headers })

describe('middlewareIdentity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('identifies a verified user by its server id, once', () => {
    middlewareIdentity(
      request({
        'x-session': JSON.stringify({
          userId: 'user-1',
          email: 'alice@example.com',
        }),
        'x-posthog-session-id': 'replay-1',
      })
    )

    expect(identified).toHaveBeenCalledTimes(1)
    expect(identified).toHaveBeenCalledWith({
      distinctId: 'user-1',
      sessionId: 'replay-1',
    })
  })

  it('sends only the session for a visitor', () => {
    middlewareIdentity(
      request({
        'x-posthog-distinct-id': 'anon-1',
        'x-posthog-session-id': 'replay-2',
      })
    )

    // The browser's id is not ours to claim: it would open a ghost profile.
    expect(identified).toHaveBeenCalledTimes(1)
    expect(identified).toHaveBeenCalledWith({
      distinctId: undefined,
      sessionId: 'replay-2',
    })
  })

  it('sends only the session for a session without email', () => {
    middlewareIdentity(
      request({
        'x-session': JSON.stringify({ userId: 'user-1' }),
        'x-posthog-session-id': 'replay-3',
      })
    )

    expect(identified).toHaveBeenCalledTimes(1)
    expect(identified).toHaveBeenCalledWith({
      distinctId: undefined,
      sessionId: 'replay-3',
    })
  })

  it('identifies nothing without session or session headers', () => {
    middlewareIdentity(request({}))

    expect(identified).toHaveBeenCalledTimes(1)
    expect(identified).toHaveBeenCalledWith({
      distinctId: undefined,
      sessionId: undefined,
    })
  })
})
