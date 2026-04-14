import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { getRules } from '@/helpers/modelFetching/getRules'
import { getUser } from '@/helpers/server/dal/user'
import { getSimulations } from '@/helpers/server/model/simulations'
import { EngineProvider, UserProvider } from '@/publicodes-state'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/fin/actions'>) {
  const { locale } = await params
  const rules = await getRules({ locale })
  const user = await getUser()
  const simulations = await getSimulations(
    { user },
    { completedOnly: true, pageSize: 1 }
  )
  return (
    <UserProvider serverSimulations={simulations} serverUserId={user.id}>
      <QueryClientProviderWrapper>
        <EngineProvider rules={rules}>{children}</EngineProvider>
      </QueryClientProviderWrapper>
    </UserProvider>
  )
}
