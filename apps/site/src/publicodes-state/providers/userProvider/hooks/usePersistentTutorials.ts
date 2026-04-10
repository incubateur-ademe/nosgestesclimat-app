import { STORAGE_KEY } from '@/constants/storage'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useEffect, useState } from 'react'
import type { Tutorials } from '../../../types'

export default function usePersistentTutorials() {
  // Upon first render, check if there are tutorials in local storage
  let localTutorials: Tutorials = {}
  if (typeof window !== 'undefined') {
    const currentStorage = safeLocalStorage.getItem(STORAGE_KEY)
    try {
      const parsedStorage = JSON.parse(currentStorage || '{}')

      if (parsedStorage.tutorials) {
        localTutorials = parsedStorage.tutorials
      }
    } catch {}
  }

  const [tutorials, setTutorials] = useState<Tutorials>(localTutorials)

  // Save the tutorials to local storage after changes
  useEffect(() => {
    const currentStorage = JSON.parse(
      safeLocalStorage.getItem(STORAGE_KEY) || '{}'
    )
    const updatedStorage = { ...currentStorage, tutorials }
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage))
  }, [tutorials])

  return { tutorials, setTutorials }
}
