import type { PendingVerification } from '@/hooks/authentication/usePendingVerification'
import type { User } from '@/publicodes-state/types'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'

interface Props {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
}
export default function useUserDetails({ setUser }: Props) {
  const updateName = useCallback(
    (name: string) =>
      setUser((prevUser: User | null) => prevUser && { ...prevUser, name }),
    [setUser]
  )

  const updatePendingVerification = useCallback(
    (pendingVerification: PendingVerification | undefined) =>
      setUser(
        (prevUser: User | null) =>
          prevUser && {
            ...prevUser,
            pendingVerification,
          }
      ),
    [setUser]
  )

  return {
    updateName,
    updatePendingVerification,
  }
}
