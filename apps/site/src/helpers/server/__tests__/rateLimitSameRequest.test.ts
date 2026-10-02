import { createHash } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RateLimitedError } from '@/components/authentication/errors'
import { failure, success } from '@nosgestesclimat/core/lib/result'
import { rateLimitSameRequest } from '../rateLimitSameRequest'

const mocks = vi.hoisted(() => ({
  redisSet: vi.fn(),
  loggerWarn: vi.fn(),
}))

vi.mock('@/adapters/redis/client', () => ({
  redis: { set: mocks.redisSet },
}))

vi.mock('@/logger', () => ({
  default: { warn: mocks.loggerWarn },
}))

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

describe('rateLimitSameRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows the first request for a key and writes it to Redis', async () => {
    mocks.redisSet.mockResolvedValue('OK')

    const result = await rateLimitSameRequest({
      key: 'login:first@example.org',
    })

    expect(result).toEqual(success({ degraded: false }))
    expect(mocks.redisSet).toHaveBeenCalledWith(
      `rateLimitSameRequests_${hashKey('login:first@example.org')}`,
      expect.any(String),
      'EX',
      30,
      'NX'
    )
  })

  it('throttles an immediate repeat of the same key', async () => {
    mocks.redisSet.mockResolvedValueOnce('OK').mockResolvedValueOnce(null)

    expect(
      await rateLimitSameRequest({ key: 'login:repeat@example.org' })
    ).toEqual(success({ degraded: false }))
    expect(
      await rateLimitSameRequest({ key: 'login:repeat@example.org' })
    ).toEqual(failure(new RateLimitedError()))
  })

  it('throttles a repeated key but not a different one', async () => {
    mocks.redisSet.mockResolvedValueOnce('OK').mockResolvedValueOnce(null)

    expect(
      (await rateLimitSameRequest({ key: 'login:user-a@example.org' })).success
    ).toBe(true)
    expect(
      (await rateLimitSameRequest({ key: 'login:user-a@example.org' })).success
    ).toBe(false)
    expect(
      (await rateLimitSameRequest({ key: 'login:user-b@example.org' })).success
    ).toBe(true)
  })

  it('passes the TTL to Redis, which owns the expiry', async () => {
    mocks.redisSet.mockResolvedValue('OK')

    await rateLimitSameRequest({
      key: 'login:ttl@example.org',
      ttlInSeconds: 5,
    })

    expect(mocks.redisSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'EX',
      5,
      'NX'
    )
  })

  it('fails open and reports the degradation when Redis is down', async () => {
    mocks.redisSet.mockRejectedValue(new Error('Redis is down'))

    const result = await rateLimitSameRequest({
      key: 'login:redis-down@example.org',
    })

    expect(result).toEqual(success({ degraded: true }))
    expect(mocks.loggerWarn).toHaveBeenCalledWith(
      'Could not rate limit same requests',
      { error: expect.any(Error) }
    )
  })
})
