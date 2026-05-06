import { STORAGE_KEY } from '@/constants/storage'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { User } from '../../../types'

interface Props {
  serverUserId: string
}
export default function usePersistentUser({ serverUserId }: Props) {
  // Upon first render, check if there is a user in local storage and format it
  // and save it to the user state
  let localUser: User = {
    userId: serverUserId,
  }
  if (typeof window !== 'undefined') {
    const currentStorage = safeLocalStorage.getItem(STORAGE_KEY)
    const parsedStorage = JSON.parse(currentStorage || '{}')

    if (parsedStorage.user) {
      localUser = formatUser({ user: parsedStorage.user })
    }
  }

  const [user, setUser] = useState(localUser)

  // Save the user to local storage after initialization
  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }, [user])

  return { user, setUser }
}

type NotFormattedUser = Omit<User, 'userId'> & {
  id?: string
  userId?: string
}
// Handle making sure the user object has a userId
function formatUser({ user }: { user: NotFormattedUser }): User {
  const formattedUser = {
    ...user,
    userId: user.userId || user.id || uuid(),
  }

  delete formattedUser.id

  return formattedUser
}
