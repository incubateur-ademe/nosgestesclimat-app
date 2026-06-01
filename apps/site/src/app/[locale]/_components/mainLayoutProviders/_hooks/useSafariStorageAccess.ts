'use client'

import { useEffect } from 'react'
import { useStoragePermissions } from './useStoragePermissions'

/**
 * Encapsulates the Certa.dev Storage Access API flow for Safari iframes.
 * https://blog.certa.dev/third-party-cookie-restrictions-for-iframes-in-safari
 */
const RELOADED_KEY = 'ngc-safari-storage-reloaded'

export function useSafariStorageAccess(isIframe: boolean) {
  const { needPermission, askForPermission, haveCheckedPermission } =
    useStoragePermissions()

  useEffect(() => {
    if (!isIframe) return
    if (
      haveCheckedPermission &&
      !needPermission &&
      !sessionStorage.getItem(RELOADED_KEY)
    ) {
      sessionStorage.setItem(RELOADED_KEY, 'true')
      window.location.reload()
    }
  }, [isIframe, haveCheckedPermission, needPermission])

  return {
    isBlocked: !haveCheckedPermission,
    needsOverlay: needPermission,
    handleAskPermission: () => askForPermission(),
  }
}
