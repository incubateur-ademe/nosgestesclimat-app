// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { isStaticRequest } from '../static-request'

describe('isStaticRequest', () => {
  it.each([
    '/_next/static/chunks/main.js',
    '/_static/cms/icone_avion_39cf1c300c.svg',
    '/images/logo.png',
    '/videos/intro.mp4',
    '/documentation/visuel.svg',
    '/favicon.ico',
    '/favicon.png',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml?get=1',
  ])('recognises %s as a file, which serves no operation', (url) => {
    expect(isStaticRequest(url)).toBe(true)
  })

  it.each([
    '/',
    '/simulateur/bilan',
    '/mon-espace',
    '/documentation/ecogestes',
    '/organisations/creer',
    '/campagne-partenaire/sedd',
    '/api/banners',
  ])('leaves %s the span of a page or a route', (url) => {
    expect(isStaticRequest(url)).toBe(false)
  })

  it('leaves a request without a url alone', () => {
    expect(isStaticRequest(undefined)).toBe(false)
  })
})
