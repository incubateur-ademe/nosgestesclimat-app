import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { rateLimitSameRequest } from '../rateLimitSameRequest'

describe('rateLimitSameRequest', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('then it should allow the first request for a key', () => {
    expect(rateLimitSameRequest({ key: 'login:first@example.org' })).toBe(true)
  })

  it('then it should throttle an immediate repeat of the same key', () => {
    expect(rateLimitSameRequest({ key: 'login:repeat@example.org' })).toBe(true)

    expect(rateLimitSameRequest({ key: 'login:repeat@example.org' })).toBe(
      false
    )
  })

  it('then it should release the key once the TTL has expired', () => {
    expect(
      rateLimitSameRequest({ key: 'login:expiry@example.org', ttlMs: 30_000 })
    ).toBe(true)

    expect(
      rateLimitSameRequest({ key: 'login:expiry@example.org', ttlMs: 30_000 })
    ).toBe(false)

    vi.advanceTimersByTime(30_000)

    expect(
      rateLimitSameRequest({ key: 'login:expiry@example.org', ttlMs: 30_000 })
    ).toBe(true)
  })

  it('then it should throttle a repeated key but not a different one', () => {
    expect(rateLimitSameRequest({ key: 'login:user-a@example.org' })).toBe(true)

    expect(rateLimitSameRequest({ key: 'login:user-a@example.org' })).toBe(
      false
    )
    expect(rateLimitSameRequest({ key: 'login:user-b@example.org' })).toBe(true)
  })

  it('then it should not throttle anymore when the same key is used past a shorter TTL', () => {
    expect(
      rateLimitSameRequest({ key: 'login:short-ttl@example.org', ttlMs: 1_000 })
    ).toBe(true)

    vi.advanceTimersByTime(999)

    expect(
      rateLimitSameRequest({ key: 'login:short-ttl@example.org', ttlMs: 1_000 })
    ).toBe(false)

    vi.advanceTimersByTime(1)

    expect(
      rateLimitSameRequest({ key: 'login:short-ttl@example.org', ttlMs: 1_000 })
    ).toBe(true)
  })

  it('then it should sweep expired entries at most once per TTL window', async () => {
    vi.resetModules()
    const { rateLimitSameRequest: limiter } =
      await import('../rateLimitSameRequest')

    limiter({ key: 'login:swept@example.org', ttlMs: 1_000 })
    vi.advanceTimersByTime(60_000)

    const deleteSpy = vi.spyOn(Map.prototype, 'delete')

    limiter({ key: 'login:after-sweep@example.org' })
    expect(deleteSpy).toHaveBeenCalledTimes(1)

    limiter({ key: 'login:within-window@example.org' })
    expect(deleteSpy).toHaveBeenCalledTimes(1)

    deleteSpy.mockRestore()
  })
})
