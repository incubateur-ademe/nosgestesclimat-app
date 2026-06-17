import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import { UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/users/get-user-session'

export default async function Layout({
  children,
}: LayoutProps<'/[locale]/amis'>) {
  const user = await getUserSession()
  const simulations = await getCompletedSimulations({ user })

  return (
    <QueryClientProviderWrapper>
      <UserProvider serverSimulations={simulations} serverUserId={user.id}>
        {children}
      </UserProvider>
    </QueryClientProviderWrapper>
  )
}
