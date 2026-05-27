import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import { carboneMetric } from '@/constants/model/metric'
import {
  END_PAGE_GROUPS_PATH,
  MON_ESPACE_GROUPS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getLinkToGroupInvitation } from '@/helpers/navigation/groupPages'
import { getUser } from '@/helpers/server/dal/user'
import { getGroup } from '@/helpers/server/model/groups'
import type { DefaultPageProps } from '@/types'
import { notFound, redirect } from 'next/navigation'
import GroupPage from './_components/GroupPage'

export default async function GroupResultsPage({
  params,
  searchParams,
}: DefaultPageProps<{ searchParams: Promise<{ groupId: string }> }>) {
  const locale = (await params).locale

  const searchParamsObject = await searchParams

  if (!searchParamsObject) {
    notFound()
  }

  const { groupId } = searchParamsObject

  if (!groupId) {
    notFound()
  }

  const user = await getUser()

  const [rules, group] = await Promise.all([
    getCachedRules({ locale }),
    getGroup({ groupId, user }),
  ])

  const userSimulation = group.participants.find(
    (participant) => participant.userId === user.id
  )?.simulation

  if (!userSimulation) {
    redirect(getLinkToGroupInvitation({ group }))
  }

  return (
    <div className="pb-8">
      <GoBackLink
        className="mb-4 font-bold"
        href={user.isAuth ? MON_ESPACE_GROUPS_PATH : END_PAGE_GROUPS_PATH}
      />
      <GroupPage
        categoriesAccordion={
          <CategoriesAccordion
            locale={locale}
            rules={rules}
            computedResults={userSimulation.computedResults}
            metric={carboneMetric}
          />
        }
      />
    </div>
  )
}
