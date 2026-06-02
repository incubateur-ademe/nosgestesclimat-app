'use client'

import {
  hasStorageAccess,
  requestStorageAccess,
  requiresStoragePermissions,
} from '@/helpers/iframe/storageAccess'
import { useCallback, useEffect, useState } from 'react'

export const useStoragePermissions = (): {
  needPermission: boolean
  askForPermission: () => Promise<void> | undefined
} => {
  const [needPermission, setNeedPermission] = useState(() => {
    if (typeof window === 'undefined') return true
    return requiresStoragePermissions()
  })

  // On mount, check if storage access is already granted (e.g. after a
  // Safari auto-reload following a successful requestStorageAccess grant).
  useEffect(() => {
    if (!requiresStoragePermissions()) return

    hasStorageAccess()
      .then((hasAccess) => {
        setNeedPermission(!hasAccess)
      })
      .catch(() => {
        // If hasStorageAccess() fails, keep the conservative default (true)
      })
  }, [])

  const askForPermission = useCallback(async () => {
    try {
      await requestStorageAccess()
      const hasAccess = await hasStorageAccess()
      setNeedPermission(!hasAccess)
    } catch {
      // Do nothing
    }
  }, [])

  return {
    needPermission,
    askForPermission: requiresStoragePermissions()
      ? askForPermission
      : () => undefined,
  }
}
