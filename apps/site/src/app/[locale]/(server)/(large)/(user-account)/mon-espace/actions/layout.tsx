import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getUser } from '@/helpers/server/dal/user'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { EngineProvider, UserProvider } from '@/publicodes-state'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/mon-espace/actions'>) {
  const locale = (await params).locale as Locale
  const user = await getUser()
  const simulations = await getCompletedSimulations({ user }, { pageSize: 1 })
  const lastCompletedSimulation = simulations.at(0)
  const rules = await getCachedRules({
    modelStr: lastCompletedSimulation?.model,
    locale,
  })

  return (
    <div data-track>
      <UserProvider serverSimulations={simulations} serverUserId={user.id}>
        <QueryClientProviderWrapper>
          <EngineProvider rules={rules}>{children}</EngineProvider>
        </QueryClientProviderWrapper>
      </UserProvider>
    </div>
  )
}
