/**
 * This component is used to track split testing data, page views, locale, and region.
 * It needs to be inside UserProvider (because of useTrackRegion).
 * That's why those hooks are in their own component.
 */
'use client'

import { useRedirectIfInAppBrowser } from '@/hooks/useRedirectIfInAppBrowser'

export default function MainHooks() {
  useRedirectIfInAppBrowser()

  return null
}
