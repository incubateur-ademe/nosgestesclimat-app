'use client'

import {
  isSafariVersionBeforeOrEgalTo18,
  isStorageAccessApiSupported,
  requestAccessViaParent,
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
    // eslint-disable-next-line no-console
    console.log('[StorageAccess] askForPermission called')

    try {
      // 1. Try direct requestStorageAccess() FIRST (user gesture is fresh)
      // eslint-disable-next-line no-console
      console.log('[StorageAccess] Trying direct requestStorageAccess()...')
      await requestStorageAccess()
      // eslint-disable-next-line no-console
      console.log('[StorageAccess] direct requestStorageAccess() succeeded')
      const needsPermission = await requiresStoragePermissions()
      setNeedPermission(needsPermission)
      return
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(
        '[StorageAccess] direct requestStorageAccess() failed:',
        error
      )
    }

    try {
      // 2. Fallback: try via parent (postMessage > requestStorageAccessForOrigin)
      // eslint-disable-next-line no-console
      console.log('[StorageAccess] Trying via parent (postMessage)...')
      const grantedViaParent = await requestAccessViaParent()
      // eslint-disable-next-line no-console
      console.log('[StorageAccess] Parent result:', grantedViaParent)

      if (grantedViaParent) {
        const needsPermission = await requiresStoragePermissions()
        setNeedPermission(needsPermission)
        return
      }

      // eslint-disable-next-line no-console
      console.log('[StorageAccess] All attempts failed, overlay stays')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[StorageAccess] Parent flow failed:', error)
    }
  }, [])

  return {
    needPermission,
    askForPermission: () => askForPermission(),
  }
}
