import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import { carboneMetric } from '@/constants/model/metric'
import {
  END_PAGE_GROUPS_PATH,
  MON_ESPACE_GROUPS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import type { DefaultPageProps } from '@/types'
import GroupPage from './_components/GroupPage'
import { groupResultsGuard } from './guard'

export default async function GroupResultsPage({
  params,
  searchParams,
}: DefaultPageProps<{ searchParams: Promise<{ groupId: string }> }>) {
  const locale = (await params).locale

  const [{ user, userSimulation, group }, rules] = await Promise.all([
    groupResultsGuard(searchParams),
    getCachedRules({ locale }),
  ])

  return (
    <div className="pb-8">
      <GoBackLink
        className="mb-4 font-bold"
        href={user.isAuth ? MON_ESPACE_GROUPS_PATH : END_PAGE_GROUPS_PATH}
      />
      <GroupPage
        group={group}
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
