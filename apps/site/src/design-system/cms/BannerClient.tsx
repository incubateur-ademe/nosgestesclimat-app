'use client'

import type { BannerType } from '@/adapters/cmsClient'
import { captureException } from '@sentry/nextjs'
import { useEffect, useState } from 'react'
import { BannerContent } from './BannerContent'

type ClientBanner = Pick<BannerType, 'link' | 'text' | 'id'>

/**
 * Le bandeau est lu côté client.
 *
 * Le chercher pendant le rendu serveur créait une boundary Suspense dans le
 * layout, donc un trou dynamique dans le pré-rendu de toutes les pages : c'est
 * ce trou qui faisait échouer l'hydratation (React rejette alors tout le HTML
 * du serveur et régénère la page). Pour un bandeau promotionnel, le rendu
 * client est le bon compromis — aucune valeur SEO, 2 Ko de contenu, et la
 * réponse de l'API est mise en cache.
 */
export default function BannerClient({ locale }: { locale: string }) {
  const [banner, setBanner] = useState<ClientBanner | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/banner?locale=${locale}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: ClientBanner | null) => setBanner(data))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          captureException(error)
        }
      })

    return () => controller.abort()
  }, [locale])

  return <BannerContent banner={banner} />
}
