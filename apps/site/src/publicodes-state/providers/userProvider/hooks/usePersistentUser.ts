import { STORAGE_KEY } from '@/constants/storage'
import type { UserSession } from '@/services/auth/get-user-session'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { User } from '../../../types'

export default function usePersistentUser(userSession: UserSession): {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
} {
  // Upon first render, check if there is a user in local storage and format it
  // and save it to the user state
  let localUser: User | null = userSession
  if (typeof window !== 'undefined') {
    const currentStorage = safeLocalStorage.getItem(STORAGE_KEY)
    const parsedStorage = JSON.parse(currentStorage ?? '{}') as {
      user?: User
    }

    if (parsedStorage.user && userSession) {
      localUser = {
        ...parsedStorage.user,
        ...userSession,
      }
    }
  }

  const [user, setUser] = useState(localUser)

  // Save the user to local storage after initialization
  useEffect(() => {
    const currentStorage = JSON.parse(
      safeLocalStorage.getItem(STORAGE_KEY) ?? '{}'
    ) as { user?: User }
    const updatedStorage = { ...currentStorage, user }
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage))
  }, [user])

  return { user, setUser }
}
