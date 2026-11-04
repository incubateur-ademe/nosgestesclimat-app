// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { middlewareStripEmail } from '../strip-email.middleware'

const request = (url: string) => new NextRequest(url)

const redirectLocation = (url: string) => {
  const { redirect } = middlewareStripEmail(request(url))
  return redirect?.headers.get('location') ?? null
}

describe('middlewareStripEmail', () => {
  it('redirects to the same URL without the email', () => {
    expect(
      redirectLocation(
        'http://localhost/fr/simulateur/bilan?email=alice%40example.org'
      )
    ).toBe('http://localhost/fr/simulateur/bilan')
  })

  it('keeps the other query params', () => {
    expect(
      redirectLocation(
        'http://localhost/fr/fin?email=alice%40example.org&utm_source=NGC'
      )
    ).toBe('http://localhost/fr/fin?utm_source=NGC')
  })

  it('drops every occurrence of the param', () => {
    expect(
      redirectLocation(
        'http://localhost/fr?email=alice%40example.org&email=bob%40example.org'
      )
    ).toBe('http://localhost/fr')
  })

  it('leaves a URL without the param alone', () => {
    const { redirect, cookies } = middlewareStripEmail(
      request('http://localhost/fr?utm_source=NGC')
    )

    expect(redirect).toBeNull()
    expect(cookies).toEqual([])
  })
})
