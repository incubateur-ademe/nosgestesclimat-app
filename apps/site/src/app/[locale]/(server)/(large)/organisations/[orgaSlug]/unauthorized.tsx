import DefaultUnautorizedAlert from '@/components/error/DefaultUnautorizedAlert'
import { ORGANISATION_SIGN_IN_PATH } from '@/constants/urls/paths'
import { getUser } from '@/helpers/server/dal/user'
import { redirect } from 'next/navigation'

export default async function UnauthorizedPage() {
  const user = await getUser()
  if (!user.isAuth) {
    redirect(ORGANISATION_SIGN_IN_PATH)
  }
  return <DefaultUnautorizedAlert />
}
