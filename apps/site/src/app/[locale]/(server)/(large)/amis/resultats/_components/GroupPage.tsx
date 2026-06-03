import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import { carboneMetric } from '@/constants/model/metric'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import type { Group } from '@/types/groups'
import EditableGroupTitle from './EditableGroupTitle'
import GroupResults from './GroupResults'
import UpdateSimulationUsed from './UpdateSimulationUsed'

interface Props {
  group: Group
  locale: Locale
  userSimulation: Simulation
}

export default async function GroupPage({
  group,
  locale,
  userSimulation,
}: Props) {
  const rules = await getCachedRules({ locale })

  return (
    <>
      <EditableGroupTitle group={group} />

      <UpdateSimulationUsed group={group} />

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
