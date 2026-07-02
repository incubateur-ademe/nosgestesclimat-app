import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import type { Locale } from '@/i18nConfig'
import { EngineProvider, UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/auth/get-user-session'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/mon-espace/actions'>) {
  const locale = (await params).locale as Locale
  const user = await getUserSession()
  const simulations = await getCompletedSimulations({ pageSize: 1 })
  const lastCompletedSimulation = simulations.at(0)
  const rules = await getCachedRules({
    modelStr: lastCompletedSimulation?.model,
    locale,
  })

  return (
    <div>
      <UserProvider serverSimulations={simulations} userSession={user}>
        <QueryClientProviderWrapper>
          <EngineProvider rules={rules}>{children}</EngineProvider>
        </QueryClientProviderWrapper>
      </UserProvider>
    </div>
  )
}
