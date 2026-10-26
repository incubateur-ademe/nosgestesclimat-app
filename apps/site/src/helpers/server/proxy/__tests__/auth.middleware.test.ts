import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from '@/helpers/server/cookie/auth.cookie'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { middlewareAuth } from '../auth.middleware'

// Dropping a client-supplied `x-session` is `proxy`'s job, ahead of the
// interceptors; this file covers what the interceptor derives from the cookie.

const mocks = vi.hoisted(() => ({
  decryptSession: vi.fn(),
  renewSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/auth/services/decrypt-session.service',
  () => ({ decryptSession: mocks.decryptSession })
)

vi.mock(
  '@nosgestesclimat/core/features/auth/services/renew-session.service',
  () => ({ renewSession: mocks.renewSession })
)

const spoofedSessionHeader = JSON.stringify({
  userId: 'spoofed-user-id',
  email: null,
})

const now = () => Math.floor(Date.now() / 1000)

const validSession = {
  userId: 'user-id',
  email: 'user@example.org',
  iat: now(),
  exp: now() + 900,
}

const expiredSession = { ...validSession, exp: now() - 1 }

function makeRequest({
  sessionCookie,
  refreshCookie,
}: {
  sessionCookie?: string
  refreshCookie?: string
} = {}): NextRequest {
  const cookies = [
    ...(sessionCookie ? [`${SESSION_COOKIE}=${sessionCookie}`] : []),
    ...(refreshCookie ? [`${REFRESH_COOKIE}=${refreshCookie}`] : []),
  ]

  return new NextRequest('http://localhost:3000/', {
    headers: {
      'x-session': spoofedSessionHeader,
      ...(cookies.length > 0 ? { cookie: cookies.join('; ') } : {}),
    },
  })
}

const expiredRequest = () =>
  makeRequest({
    sessionCookie: 'expired-cookie-value',
    refreshCookie: 'refresh-cookie-value',
  })

describe('middlewareAuth', () => {
  beforeEach(() => {
    mocks.decryptSession.mockReset()
    mocks.renewSession.mockReset()
  })

  it('stays anonymous when the request carries no session cookie', async () => {
    const result = await middlewareAuth(makeRequest())

    expect(result).toEqual({ redirect: null, cookies: [] })
  })

  it('clears the session cookies when the session cookie is corrupted', async () => {
    mocks.decryptSession.mockRejectedValueOnce(new Error('corrupted cookie'))

    const result = await middlewareAuth(
      makeRequest({ sessionCookie: 'garbage-cookie-value' })
    )

    expect(result.redirect).toBeNull()
    expect(result.cookies).toHaveLength(2)
  })

  it('derives the identity from the cookie, not from the incoming header', async () => {
    mocks.decryptSession.mockResolvedValueOnce(validSession)

    const request = makeRequest({ sessionCookie: 'valid-cookie-value' })
    await middlewareAuth(request)

    expect(request.headers.get('x-session')).toBe(
      JSON.stringify({ userId: 'user-id', email: 'user@example.org' })
    )
  })

  it('clears the session cookies when the session is expired and no refresh cookie is left', async () => {
    mocks.decryptSession.mockResolvedValueOnce(expiredSession)

    const result = await middlewareAuth(
      makeRequest({ sessionCookie: 'expired-cookie-value' })
    )

    expect(result.redirect).toBeNull()
    expect(result.cookies).toHaveLength(2)
  })

  it('renews an expired session with the refresh cookie', async () => {
    mocks.decryptSession.mockResolvedValueOnce(expiredSession)
    mocks.renewSession.mockResolvedValueOnce({
      status: 'rotated',
      tokens: {
        accessToken: 'fresh-access-token',
        refreshToken: 'fresh-refresh-token',
      },
    })

    const request = expiredRequest()
    const result = await middlewareAuth(request)

    // The renewal is fed from the expired payload: reading it is why
    // `readSession` does not drop it.
    expect(mocks.renewSession).toHaveBeenCalledWith({
      refreshToken: 'refresh-cookie-value',
      email: 'user@example.org',
    })
    expect(result.cookies.map((cookie) => cookie.value)).toEqual(
      expect.arrayContaining(['fresh-access-token', 'fresh-refresh-token'])
    )
    expect(request.headers.get('x-session')).toBe(
      JSON.stringify({ userId: 'user-id', email: 'user@example.org' })
    )
  })

  it('leaves a transient failure to the next request instead of logging out', async () => {
    mocks.decryptSession.mockResolvedValueOnce(expiredSession)
    mocks.renewSession.mockRejectedValueOnce(new Error('database is down'))

    const result = await middlewareAuth(expiredRequest())

    // The session was never proven dead, so nothing may be cleared: a concurrent
    // request may hold the key that makes it work.
    expect(result).toEqual({ redirect: null, cookies: [] })
  })

  it('keeps a concurrent request alive without re-setting the refresh cookie', async () => {
    mocks.decryptSession.mockResolvedValueOnce(expiredSession)
    mocks.renewSession.mockResolvedValueOnce({
      status: 'concurrent',
      ageMs: 120,
      tokens: { accessToken: 'concurrent-access-token' },
    })

    const result = await middlewareAuth(expiredRequest())

    const names = result.cookies.map((cookie) => cookie.name)
    expect(names).toEqual([SESSION_COOKIE])
    expect(result.cookies[0].value).toBe('concurrent-access-token')
  })

  it('clears the cookies of a replayed credential', async () => {
    mocks.decryptSession.mockResolvedValueOnce(expiredSession)
    mocks.renewSession.mockResolvedValueOnce({
      status: 'replayed',
      ageMs: 300_000,
    })

    const result = await middlewareAuth(expiredRequest())

    expect(result.redirect).toBeNull()
    expect(result.cookies).toHaveLength(2)
  })

  it('clears the cookies when the refresh key is unrecognised', async () => {
    mocks.decryptSession.mockResolvedValueOnce(expiredSession)
    mocks.renewSession.mockResolvedValueOnce({ status: 'unrecognised' })

    const result = await middlewareAuth(expiredRequest())

    expect(result.redirect).toBeNull()
    expect(result.cookies).toHaveLength(2)
  })
})
