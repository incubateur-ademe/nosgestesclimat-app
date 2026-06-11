'use client'

import {
  requestStorageAccess,
  requiresStoragePermissions,
} from '@/helpers/iframe/storageAccess'
import { captureException } from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'

export const useStoragePermissions = (): {
  needPermission: boolean
  askForPermission: () => Promise<void> | undefined
} => {
  const [needPermission, setNeedPermission] = useState(false)

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
    // Step 1: request storage access
    try {
      // eslint-disable-next-line
      console.log('[StorageAccess] Calling requestStorageAccess…')
      await requestStorageAccess()
      // eslint-disable-next-line
      console.log('[StorageAccess] requestStorageAccess succeeded')
    } catch (error) {
      // eslint-disable-next-line
      console.warn('[StorageAccess] requestStorageAccess failed:', {
        error,
        type: typeof error,
        constructor: error?.constructor?.name,
        // @ts-expect-error eojef
        message: error?.message,
      })
      captureException(error)
      return
    }

    // Step 2: re-check permissions
    try {
      const needsPermission = await requiresStoragePermissions()
      // eslint-disable-next-line
      console.log(
        '[StorageAccess] requiresStoragePermissions result:',
        needsPermission
      )
      setNeedPermission(needsPermission)
    } catch (error) {
      // eslint-disable-next-line
      console.warn('[StorageAccess] requiresStoragePermissions failed:', {
        error,
        type: typeof error,
        constructor: error?.constructor?.name,
        // @ts-expect-error eojef
        message: error?.message,
      })
      captureException(error)
    }
  }, [])

  return {
    needPermission,
    askForPermission: () => askForPermission(),
  }
}
