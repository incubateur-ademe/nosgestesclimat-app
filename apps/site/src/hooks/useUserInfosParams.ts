import { useUser } from '@/publicodes-state'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const useUserInfosParams = () => {
  const searchParams = useSearchParams()

  const { user, updateName, updateEmail } = useUser()

  const isUserInitialized = user.userId ? true : false

  useEffect(() => {
    if (!isUserInitialized) {
      return
    }
    const emailInQueryParams = searchParams.get('email')
    const nameInQueryParams = searchParams.get('name')

    if (emailInQueryParams) {
      updateEmail(emailInQueryParams)
    }
    if (nameInQueryParams) {
      updateName(nameInQueryParams)
    }
  }, [searchParams, updateEmail, updateName, isUserInitialized])
}
