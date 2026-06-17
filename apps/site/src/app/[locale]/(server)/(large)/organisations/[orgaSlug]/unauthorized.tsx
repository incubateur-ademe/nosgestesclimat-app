import DefaultUnautorizedAlert from '@/components/error/DefaultUnautorizedAlert'
import { ORGANISATION_SIGN_IN_PATH } from '@/constants/urls/paths'
import { getUserSession } from '@/services/users/get-user-session'
import { redirect } from 'next/navigation'

export default async function UnauthorizedPage() {
  const user = await getUserSession()
  if (!user.isAuth) {
    redirect(ORGANISATION_SIGN_IN_PATH)
  }
  return <DefaultUnautorizedAlert />
}
