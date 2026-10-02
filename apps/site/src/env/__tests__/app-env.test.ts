import { afterEach, describe, expect, it, vi } from 'vitest'

// `app-env` reads `process.env` at import time: every case has to reset the
// module registry to exercise another environment.
const loadAppEnv = async (siteUrl: string | undefined) => {
  vi.resetModules()

  if (siteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = siteUrl
  }

  return await import('../app-env')
}

afterEach(() => {
  vi.resetModules()
  // The value `vitest.config.ts` provides.
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
})

describe('APP_ENV', () => {
  it.each([
    ['https://nosgestesclimat.fr', 'production'],
    ['https://preprod.nosgestesclimat.fr', 'preprod'],
    // Review apps are served by Next directly, without nginx: they must NOT be
    // mistaken for preprod (cf. the `/_static/cms` proxy).
    [
      'https://nosgestesclimat-site-preprod-pr1950.osc-fr1.scalingo.io',
      'review',
    ],
    ['http://localhost:3000', 'development'],
    [undefined, 'development'],
  ])('derives %s into %s', async (siteUrl, expected) => {
    const { APP_ENV } = await loadAppEnv(siteUrl)

    expect(APP_ENV).toBe(expected)
  })
})
