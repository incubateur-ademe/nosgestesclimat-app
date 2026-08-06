import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import { carboneMetric } from '@/constants/model/metric'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import type { AppUser } from '@/services/auth/get-user-session'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import type { Group } from '@/types/groups'
import dayjs from 'dayjs'
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

  // The user may have completed a newer test since joining the group; offer to
  // update their participation with it. Resolved server-side so it stays in
  // sync with `group` after `revalidatePath`.
  const [latestCompletedSimulation] = await getCompletedSimulations({
    pageSize: 1,
  })
  const newSimulation =
    latestCompletedSimulation &&
    latestCompletedSimulation.id !== userSimulation.id &&
    dayjs(latestCompletedSimulation.date).isAfter(dayjs(userSimulation.date))
      ? latestCompletedSimulation
      : undefined

  return (
    <>
      <EditableGroupTitle group={group} />

      {newSimulation && (
        <UpdateSimulationUsed
          group={group}
          user={user}
          latestSimulation={newSimulation}
        />
      )}

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
