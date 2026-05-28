'use client'

import { useEffect } from 'react'
import { useStoragePermissions } from './useStoragePermissions'

/**
 * Encapsulates the Certa.dev Storage Access API flow for Safari iframes.
 * https://blog.certa.dev/third-party-cookie-restrictions-for-iframes-in-safari
 */
export function useSafariStorageAccess(isIframe: boolean) {
  const { needPermission, askForPermission, haveCheckedPermission } =
    useStoragePermissions()

  useEffect(() => {
    if (!isIframe) return
    if (haveCheckedPermission && !needPermission) {
      window.location.reload()
    }
  }, [isIframe, haveCheckedPermission, needPermission])

  return {
    isBlocked: !haveCheckedPermission,
    needsOverlay: needPermission,
    handleAskPermission: () => askForPermission(),
  }
}
