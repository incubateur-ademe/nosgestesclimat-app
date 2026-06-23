'use client'

import {
  isSafariVersionBeforeOrEgalTo18,
  isStorageAccessApiSupported,
  requestStorageAccess,
  requiresStoragePermissions,
} from '@/helpers/iframe/storageAccess'
import { useCallback, useEffect, useState } from 'react'

export const useStoragePermissions = (): {
  needPermission: boolean
  askForPermission: () => Promise<void> | undefined
} => {
  // Only Safari ≤ 18 needs the storage access permission flow.
  // Use a synchronous Safari check for the initial state to avoid
  // flashing the overlay on Firefox / Chrome before the async check resolves.
  const [needPermission, setNeedPermission] = useState(
    () => isSafariVersionBeforeOrEgalTo18() && isStorageAccessApiSupported()
  )

  // On mount, check if storage access is already granted (e.g. after a
  // Safari auto-reload following a successful requestStorageAccess grant).
  useEffect(() => {
    requiresStoragePermissions()
      .then(setNeedPermission)
      .catch(() => {
        // Keep the conservative default (true)
      })
  }, [])

  const askForPermission = useCallback(async () => {
    try {
      await requestStorageAccess()
      const needsPermission = await requiresStoragePermissions()
      setNeedPermission(needsPermission)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[StorageAccess] requestStorageAccess failed:', error)
    }
  }, [])

  return {
    needPermission,
    askForPermission: () => askForPermission(),
  }
}
