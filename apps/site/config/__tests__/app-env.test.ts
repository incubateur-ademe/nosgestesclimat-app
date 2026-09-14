import { afterEach, describe, expect, it, vi } from 'vitest'

// `app-env` lit `process.env` au chargement du module : il faut donc réinitialiser
// le registre de modules entre chaque cas pour tester les différents environnements.
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
  // Valeur fournie par vitest.config.ts
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
})

describe('APP_ENV', () => {
  it.each([
    ['https://nosgestesclimat.fr', 'production'],
    ['https://preprod.nosgestesclimat.fr', 'preprod'],
    // Les review apps sont servies directement par Next.js, sans Nginx : elles
    // ne doivent PAS être confondues avec preprod (cf. proxy /_static/cms).
    [
      'https://nosgestesclimat-site-preprod-pr1950.osc-fr1.scalingo.io',
      'review',
    ],
    ['http://localhost:3000', 'development'],
    [undefined, 'development'],
  ])('dérive %s en %s', async (siteUrl, expected) => {
    const { APP_ENV } = await loadAppEnv(siteUrl)

    expect(APP_ENV).toBe(expected)
  })
})
