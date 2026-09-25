import { SESSION_COOKIE } from '@/helpers/server/cookie/auth.cookie'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { middlewareAuth } from '../auth.middleware'

const mocks = vi.hoisted(() => ({
  decryptSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/auth/services/decrypt-session.service',
  () => ({ decryptSession: mocks.decryptSession })
)

const spoofedSessionHeader = JSON.stringify({
  userId: 'spoofed-user-id',
  email: null,
})

function makeRequest(sessionCookie?: string): NextRequest {
  return new NextRequest('http://localhost:3000/', {
    headers: {
      'x-session': spoofedSessionHeader,
      ...(sessionCookie
        ? { cookie: `${SESSION_COOKIE}=${sessionCookie}` }
        : {}),
    },
  })
}

describe('middlewareAuth', () => {
  beforeEach(() => {
    mocks.decryptSession.mockReset()
  })

  it('strips a client-supplied x-session header when there is no session cookie', async () => {
    const request = makeRequest()

    const result = await middlewareAuth(request)

    expect(request.headers.get('x-session')).toBeNull()
    expect(result.redirect).toBeNull()
    expect(result.cookies).toEqual([])
  })

  it('strips a client-supplied x-session header when the session cookie is corrupted', async () => {
    mocks.decryptSession.mockRejectedValueOnce(new Error('corrupted cookie'))
    const request = makeRequest('garbage-cookie-value')

    const result = await middlewareAuth(request)

    expect(request.headers.get('x-session')).toBeNull()
    expect(result.redirect).toBeNull()
    expect(result.cookies).toHaveLength(2)
  })

  it('keeps setting the x-session header from the decrypted cookie on the authenticated path', async () => {
    mocks.decryptSession.mockResolvedValueOnce({
      userId: 'real-user-id',
      email: 'user@example.org',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    })
    const request = makeRequest('valid-cookie-value')

    const result = await middlewareAuth(request)

    expect(request.headers.get('x-session')).toBe(
      JSON.stringify({ userId: 'real-user-id', email: 'user@example.org' })
    )
    expect(result.redirect).toBeNull()
    expect(result.cookies).toEqual([])
  })
})
