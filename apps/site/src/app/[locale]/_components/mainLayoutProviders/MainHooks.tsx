/**
 * This component is used to track split testing data, page views, locale, and region.
 * It needs to be inside UserProvider (because of useTrackRegion).
 * That's why those hooks are in their own component.
 */
'use client'

import { useInitSimulationParam } from '@/hooks/useInitSimulationParam'
import { useRedirectIfInAppBrowser } from '@/hooks/useRedirectIfInAppBrowser'
import { useUserInfosParams } from '@/hooks/useUserInfosParams'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function MainHooks() {
  const pathname = usePathname()

  useUserInfosParams()
  useInitSimulationParam()
  useRedirectIfInAppBrowser()

  // Réinitialise le scroll de la fenêtre à chaque changement de route.
  // Next.js le fait déjà pour les navigations <Link> standard, mais certains
  // cas (middleware i18n, back/forward du navigateur) peuvent le contourner.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
