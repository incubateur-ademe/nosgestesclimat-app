import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { getUser } from '@/helpers/server/dal/user'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import { UserProvider } from '@/publicodes-state'

export default async function Layout({
  children,
}: LayoutProps<'/[locale]/amis'>) {
  const user = await getUser()
  const simulations = await getCompletedSimulations({ user })

  return (
    <QueryClientProviderWrapper>
      <UserProvider serverSimulations={simulations} serverUserId={user.id}>
        {children}
      </UserProvider>
    </QueryClientProviderWrapper>
  )
}
