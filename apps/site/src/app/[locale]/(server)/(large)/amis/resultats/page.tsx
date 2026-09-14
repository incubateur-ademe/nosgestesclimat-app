import { carboneMetric, eauMetric } from '@/constants/model/metric'
import {
  END_PAGE_GROUPS_PATH,
  MON_ESPACE_GROUPS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { EngineProvider, UserProvider } from '@/publicodes-state'
import type { DefaultPageProps } from '@/types'
import GroupPage from './_components/GroupPage'
import { groupResultsGuard } from './guard'

export default async function GroupResultsPage({
  params,
  searchParams,
}: DefaultPageProps<{
  searchParams: Promise<{ groupId: string; metric?: string }>
}>) {
  const locale = (await params).locale

  // La métrique vit dans l'URL (cf. `GroupFootprintSelector`) : le serveur peut
  // donc rendre directement le bloc correspondant.
  const metric =
    (await searchParams)?.metric === eauMetric ? eauMetric : carboneMetric

  const [{ user, group, userSimulation }, rules] = await Promise.all([
    groupResultsGuard(searchParams),
    getCachedRules({ locale }),
  ])

  return (
    /*
      The engine seeds its situation from the provider's simulation, so the
      provider must hold the simulation the group actually uses — not the
      user's newest one — otherwise the chart and the accordion below would
      describe two different tests.

      Keyed by its id so that updating the participation to a newer simulation
      re-seeds both the provider and the engine, which only read it at mount.
    */
    <UserProvider
      key={userSimulation.id}
      simulation={userSimulation}
      userSession={user}>
      <EngineProvider rules={rules}>
        <div className="pb-8">
          <GoBackLink
            className="mb-4 font-bold"
            href={user.isAuth ? MON_ESPACE_GROUPS_PATH : END_PAGE_GROUPS_PATH}
          />
          <GroupPage
            group={group}
            locale={locale}
            metric={metric}
            user={user}
            userSimulation={userSimulation}
          />
        </div>
      </EngineProvider>
    </UserProvider>
  )
}
