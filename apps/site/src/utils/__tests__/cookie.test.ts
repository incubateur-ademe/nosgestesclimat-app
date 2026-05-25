import { describe, expect, it } from 'vitest'
import { getClientCookie } from '../cookie'

describe('getClientCookie', () => {
  it('returns undefined when document is not available (SSR)', () => {
    expect(getClientCookie('test')).toBeUndefined()
  })

  it('returns undefined for a missing cookie', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'other=foo',
      writable: true,
    })
    expect(getClientCookie('missing')).toBeUndefined()
  })

  it('returns a plain value', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'myCookie=hello',
      writable: true,
    })
    expect(getClientCookie('myCookie')).toBe('hello')
  })

  it('returns a URL-encoded value', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'myCookie=%7B%22key%22%3Atrue%7D',
      writable: true,
    })
    expect(getClientCookie('myCookie')).toBe('{"key":true}')
  })

  it('returns the first match when multiple cookies are present', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'a=1; b=2; target=found; c=3',
      writable: true,
    })
    expect(getClientCookie('target')).toBe('found')
  })

  it('escapes special regex characters in the cookie name', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'some.cookie[name]=escaped',
      writable: true,
    })
    expect(getClientCookie('some.cookie[name]')).toBe('escaped')
  })

  it('handles a cookie name that is a prefix of another cookie name', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'ff=short; ff_longer=other',
      writable: true,
    })
    expect(getClientCookie('ff')).toBe('short')
  })
})
