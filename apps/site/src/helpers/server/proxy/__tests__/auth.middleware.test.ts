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
  rotateSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/auth/services/decrypt-session.service',
  () => ({ decryptSession: mocks.decryptSession })
)

vi.mock(
  '@nosgestesclimat/core/features/auth/services/rotate-session.service',
  () => ({ rotateSession: mocks.rotateSession })
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

describe('middlewareAuth', () => {
  beforeEach(() => {
    mocks.decryptSession.mockReset()
    mocks.rotateSession.mockReset()
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

  it('rotates an expired session with the refresh cookie', async () => {
    mocks.decryptSession.mockResolvedValueOnce(expiredSession)
    mocks.rotateSession.mockResolvedValueOnce({
      accessToken: 'fresh-access-token',
      refreshToken: 'fresh-refresh-token',
    })

    const request = makeRequest({
      sessionCookie: 'expired-cookie-value',
      refreshCookie: 'refresh-cookie-value',
    })
    const result = await middlewareAuth(request)

    // The rotation is fed from the expired payload: reading it is why
    // `readSession` does not drop it.
    expect(mocks.rotateSession).toHaveBeenCalledWith(
      'refresh-cookie-value',
      'user@example.org'
    )
    expect(result.cookies.map((cookie) => cookie.value)).toContain(
      'fresh-access-token'
    )
    expect(request.headers.get('x-session')).toBe(
      JSON.stringify({ userId: 'user-id', email: 'user@example.org' })
    )
  })
})
