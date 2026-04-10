import type { LocalStorage } from '@/publicodes-state/types'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  storageKey: string
}

export default function useUpdateOldLocalStorage({ storageKey }: Props) {
  useEffect(() => {
    const oldLocalStorage = safeLocalStorage.getItem(
      'ecolab-climat::persisted-simulation::v2'
    )
    const currentLocalStorage: LocalStorage = JSON.parse(
      safeLocalStorage.getItem(storageKey) || '{}'
    )
    const objectOldLocalStorage = JSON.parse(oldLocalStorage || '{}')

    const isCurrentLocalStorageEmpty =
      Object.keys(currentLocalStorage).length === 0

    // We don't import the storage if you have a simulation with a persona because it's too buggy and no one cares
    // We also don't import old localstorage if the current "new" localstorage is not empty
    if (
      oldLocalStorage &&
      !oldLocalStorage.includes('persona') &&
      isCurrentLocalStorageEmpty
    ) {
      safeLocalStorage.setItem(
        storageKey,
        JSON.stringify({
          ...objectOldLocalStorage,
          user: {
            ...(objectOldLocalStorage?.user ?? {}),
            userId: objectOldLocalStorage?.user?.userId ?? uuidv4(),
          },
        })
      )

      safeLocalStorage.removeItem('ecolab-climat::persisted-simulation::v2')
    }
  }, [storageKey])
}
