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
  haveCheckedPermission: boolean
} => {
  const [needPermission, setNeedPermission] = useState(
    requiresStoragePermissions()
  )
  const [haveCheckedPermission, setHaveCheckedPermission] = useState(
    !requiresStoragePermissions()
  )

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
      await requestStorageAccess()
      await checkPermission()
    } catch {
      // User denied or API not available — unblock the UI
      setHaveCheckedPermission(true)
    }
  }, [checkPermission])

  useEffect(() => {
    if (requiresStoragePermissions()) {
      checkPermission().catch(() => undefined)
    }
  }, [checkPermission])

  return {
    needPermission,
    askForPermission: requiresStoragePermissions()
      ? askForPermission
      : () => undefined,
    haveCheckedPermission,
  }
}
