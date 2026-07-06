import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import { carboneMetric } from '@/constants/model/metric'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { AppUser } from '@/services/auth/get-user-session'
import type { Locale } from '@/i18nConfig'
import type { Group } from '@/types/groups'
import EditableGroupTitle from './EditableGroupTitle'
import GroupResults from './GroupResults'
import UpdateSimulationUsed from './UpdateSimulationUsed'

interface Props {
  group: Group
  locale: Locale
  user: AppUser
  userSimulation: Simulation
}

export default async function GroupPage({
  group,
  locale,
  user,
  userSimulation,
}: Props) {
  const rules = await getCachedRules({ locale })

  return (
    <>
      <EditableGroupTitle group={group} />

      <UpdateSimulationUsed group={group} user={user} />

      <GroupResults
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
    </>
  )
}
