'use client'

import { useRedirectIfInAppBrowser } from '@/hooks/useRedirectIfInAppBrowser'

export default function MainHooks() {
  useRedirectIfInAppBrowser()

  return null
}
