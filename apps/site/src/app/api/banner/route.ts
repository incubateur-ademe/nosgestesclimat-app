import i18nConfig, { type Locale } from '@/i18nConfig'
import { fetchBanner } from '@/services/cms/fetchBanner'
import { NextResponse } from 'next/server'

/**
 * Le bandeau CMS est lu par un îlot client (`BannerClient`).
 *
 * Attendu dans le layout, il créait une boundary Suspense — donc un trou
 * dynamique dans le pré-rendu de *toutes* les pages — pour une donnée
 * décorative de 2 Ko. L'aller-retour est ici mis en cache, et payé une fois par
 * visite plutôt que par un mismatch d'hydratation sur chaque page.
 */
export async function GET(request: Request) {
  const requestedLocale = new URL(request.url).searchParams.get('locale')

  const locale = i18nConfig.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : i18nConfig.defaultLocale

  return NextResponse.json(await fetchBanner(locale), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
