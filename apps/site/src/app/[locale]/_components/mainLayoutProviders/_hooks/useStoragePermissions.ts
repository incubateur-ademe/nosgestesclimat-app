'use client'

import {
  hasStorageAccess,
  requestStorageAccess,
  requiresStoragePermissions,
} from '@/helpers/iframe/storageAccess'
import { useCallback, useState } from 'react'

interface StorageAccessError {
  name: string
  message: string
}

export const useStoragePermissions = (): {
  needPermission: boolean
  askForPermission: () => Promise<void> | undefined
  haveCheckedPermission: boolean
  storageAccessError: StorageAccessError | null
} => {
  const [needPermission, setNeedPermission] = useState(
    requiresStoragePermissions()
  )
  const [haveCheckedPermission, setHaveCheckedPermission] = useState(
    !requiresStoragePermissions()
  )
  const [storageAccessError, setStorageAccessError] =
    useState<StorageAccessError | null>(null)

  const isHavingPermissionFn = useCallback(async () => {
    try {
      return await hasStorageAccess()
    } catch {
      return false
    }
  }, [])

  const checkPermission = useCallback(async () => {
    try {
      const isHavingPerm = await isHavingPermissionFn()
      setNeedPermission(!isHavingPerm)
      setHaveCheckedPermission(true)
    } catch {
      setHaveCheckedPermission(true)
    }
  }, [isHavingPermissionFn])

  const askForPermission = useCallback(async () => {
    try {
      setStorageAccessError(null)
      await requestStorageAccess()
      await checkPermission()
    } catch (error) {
      const name = error instanceof Error ? error.name : 'Unknown'
      const message = error instanceof Error ? error.message : String(error)

      // eslint-disable-next-line no-console
      console.error('[NGC Safari Fix] askForPermission failed', {
        name,
        message,
        error,
      })

      // Post to parent window so it's visible without opening iframe devtools
      try {
        window.parent.postMessage(
          {
            type: 'NGC_STORAGE_ACCESS_ERROR',
            name,
            message,
          },
          '*'
        )
      } catch {
        // cross-origin postMessage may fail
      }

      setStorageAccessError({ name, message })
      setHaveCheckedPermission(true)
    }
  }, [checkPermission])

  return {
    needPermission,
    askForPermission: requiresStoragePermissions()
      ? askForPermission
      : () => undefined,
    haveCheckedPermission,
    storageAccessError,
  }
}
