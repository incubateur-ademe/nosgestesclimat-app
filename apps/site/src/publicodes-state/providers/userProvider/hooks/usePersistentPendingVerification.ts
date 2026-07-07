import type { PendingVerification } from '@/components/authentication/authenticateUserForm/_hooks/usePendingVerification'
import { STORAGE_KEY } from '@/constants/storage'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export default function usePersistentPendingVerification(): {
  pendingVerification: PendingVerification | null
  setPendingVerification: Dispatch<SetStateAction<PendingVerification | null>>
} {
  let initial: PendingVerification | null = null
  if (typeof window !== 'undefined') {
    try {
      const currentStorage = safeLocalStorage.getItem(STORAGE_KEY)
      const parsedStorage = JSON.parse(currentStorage ?? '{}') as {
        pendingVerification?: PendingVerification | null
      }
      if (parsedStorage.pendingVerification) {
        initial = parsedStorage.pendingVerification
      }
    } catch {
      // ignore corrupted storage
    }
  }

  const [pendingVerification, setPendingVerification] = useState(initial)

  useEffect(() => {
    const currentStorage = JSON.parse(
      safeLocalStorage.getItem(STORAGE_KEY) ?? '{}'
    ) as Record<string, unknown>
    const updatedStorage = { ...currentStorage, pendingVerification }
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage))
  }, [pendingVerification])

  return { pendingVerification, setPendingVerification }
}
