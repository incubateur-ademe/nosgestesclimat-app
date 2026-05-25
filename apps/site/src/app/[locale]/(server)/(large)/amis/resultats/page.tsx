import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import { carboneMetric } from '@/constants/model/metric'
import {
  END_PAGE_GROUPS_PATH,
  MON_ESPACE_GROUPS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getUser } from '@/helpers/server/dal/user'
import { getCurrentSimulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import type { DefaultPageProps } from '@/types'
import GroupPage from './_components/GroupPage'

export default async function GroupResultsPage({ params }: DefaultPageProps) {
  const user = await getUser()
  const locale = (await params).locale as Locale
  const rules = await getCachedRules({ locale })
  const currentSimulation = await getCurrentSimulation({ user })

  const categoriesAccordion = currentSimulation?.computedResults ? (
    <CategoriesAccordion
      locale={locale}
      rules={rules}
      computedResults={currentSimulation.computedResults}
      metric={carboneMetric}
    />
  ) : undefined

  return (
    <div className="pb-8">
      <GoBackLink
        className="mb-4 font-bold"
        href={user.isAuth ? MON_ESPACE_GROUPS_PATH : END_PAGE_GROUPS_PATH}
      />
      <GroupPage categoriesAccordion={categoriesAccordion} />
    </div>
  )
}
