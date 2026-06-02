'use client'

import { useStoragePermissions } from './useStoragePermissions'

export function useSafariStorageAccess() {
  const { needPermission, askForPermission } = useStoragePermissions()

  return {
    isBlocked: needPermission,
    needsOverlay: needPermission,
    handleAskPermission: () => askForPermission(),
  }
}
