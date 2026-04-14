import { STORAGE_KEY } from '@/constants/storage'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { RegionFromGeolocation, User } from '../../../types'

interface Props {
  initialRegion?: RegionFromGeolocation
  serverUserId: string
}
export default function usePersistentUser({
  initialRegion,
  serverUserId,
}: Props) {
  // Upon first render, check if there is a user in local storage and format it
  // and save it to the user state
  let localUser: User = {
    region: initialRegion,
    initialRegion: initialRegion,
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
    const currentStorage = JSON.parse(
      safeLocalStorage.getItem(STORAGE_KEY) || '{}'
    )
    const updatedStorage = { ...currentStorage, user }
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage))
  }, [user])

  // Return a default state while we wait for the initial region to be set
  if (!initialRegion) {
    return {
      user: {
        region: {
          code: '',
          name: '',
        },
        initialRegion: {
          code: '',
          name: '',
        },
        // Use serverUserId or localUser.userId to maintain consistency across renders
        userId: serverUserId,
      },
      setUser: () => {},
    }
  }

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
