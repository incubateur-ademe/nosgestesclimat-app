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
    try {
      await requestStorageAccess()
      const needsPermission = await requiresStoragePermissions()
      setNeedPermission(needsPermission)
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
      captureException(error)
      // Do nothing
    }
  }, [])

  return {
    needPermission,
    askForPermission: () => askForPermission(),
  }
}
