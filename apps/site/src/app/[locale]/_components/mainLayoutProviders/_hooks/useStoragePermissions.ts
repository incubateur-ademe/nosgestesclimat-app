'use client'

import {
  hasStorageAccess,
  requestStorageAccess,
  requiresStoragePermissions,
} from '@/helpers/iframe/storageAccess'
import { useCallback, useState } from 'react'

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
      console.log(
        '[NGC Safari Fix] askForPermission: calling requestStorageAccess'
      )
      await requestStorageAccess()
      console.log(
        '[NGC Safari Fix] askForPermission: requestStorageAccess succeeded'
      )
      await checkPermission()
    } catch (error) {
      console.log('[NGC Safari Fix] askForPermission: failed', error)
      // User denied or API not available — unblock the UI
      setNeedPermission(false)
      setHaveCheckedPermission(true)
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
