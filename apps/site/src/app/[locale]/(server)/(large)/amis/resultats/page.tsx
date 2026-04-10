import {
  END_PAGE_GROUPS_PATH,
  MON_ESPACE_GROUPS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import { getUser } from '@/helpers/server/dal/user'
import GroupPage from './_components/GroupPage'

export default async function GroupResultsPage() {
  const user = await getUser()
  return (
    <div className="pb-8">
      <GoBackLink
        className="mb-4 font-bold"
        href={user.isAuth ? MON_ESPACE_GROUPS_PATH : END_PAGE_GROUPS_PATH}
      />
      <GroupPage />
    </div>
  )
}
