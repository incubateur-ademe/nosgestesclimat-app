import DefaultUnautorizedAlert from '@/components/error/DefaultUnautorizedAlert'
import { ORGANISATION_SIGN_IN_PATH } from '@/constants/urls/paths'
import { requireAuthUser } from '@/services/auth/require-auth-user'

export default async function UnauthorizedPage() {
  await requireAuthUser({ redirect: ORGANISATION_SIGN_IN_PATH })
  return <DefaultUnautorizedAlert />
}
