import type { PendingVerification } from '@/hooks/authentication/usePendingVerification'
import type {
  RegionFromGeolocation,
  User,
  UserOrganisationInfo,
} from '@/publicodes-state/types'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'

interface Props {
  user: User
  setUser: Dispatch<SetStateAction<User>>
}
export default function useUserDetails({ setUser }: Props) {
  const updateUserId = useCallback(
    (userId: string) => setUser((prevUser: User) => ({ ...prevUser, userId })),
    [setUser]
  )

  const updateName = useCallback(
    (name: string) => setUser((prevUser: User) => ({ ...prevUser, name })),
    [setUser]
  )

  const updateEmail = useCallback(
    (email: string) => setUser((prevUser: User) => ({ ...prevUser, email })),
    [setUser]
  )

  const updateRegion = useCallback(
    (region: RegionFromGeolocation) =>
      setUser((prevUser: User) => ({ ...prevUser, region })),
    [setUser]
  )

  const updateInitialRegion = useCallback(
    (initialRegion: RegionFromGeolocation) =>
      setUser((prevUser: User) => ({ ...prevUser, initialRegion })),
    [setUser]
  )

  const updatePendingVerification = useCallback(
    (pendingVerification: PendingVerification | undefined) =>
      setUser((prevUser: User) => ({
        ...prevUser,
        pendingVerification,
      })),
    [setUser]
  )

  const updateUserOrganisation = useCallback(
    (organisation: UserOrganisationInfo) => {
      const organisationModifications: UserOrganisationInfo = {}

      if (organisation.administratorEmail !== undefined) {
        organisationModifications.administratorEmail =
          organisation.administratorEmail
      }

      if (organisation.slug !== undefined) {
        organisationModifications.slug = organisation.slug
      }

      if (organisation.name !== undefined) {
        organisationModifications.name = organisation.name
      }

      setUser((prevUser: User) => ({
        ...prevUser,
        organisation: {
          ...prevUser.organisation,
          ...organisationModifications,
        },
      }))
    },
    [setUser]
  )

  return {
    updateUserId,
    updateName,
    updateEmail,
    updateRegion,
    updateInitialRegion,
    updatePendingVerification,
    updateUserOrganisation,
  }
}
