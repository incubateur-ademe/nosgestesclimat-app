import { getUserSession } from '@/services/auth/get-user-session'
import MySpaceButtonLink from './MySpaceButtonLink'
import MySpaceDropdown from './MySpaceDropdown'

export default async function MySpaceButton() {
  const user = await getUserSession()
  if (user?.isAuth) {
    return <MySpaceDropdown email={user.email} />
  }

  return <MySpaceButtonLink />
}
