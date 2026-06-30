import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import { UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/auth/get-user-session'

export default async function Layout({
  children,
}: LayoutProps<'/[locale]/amis'>) {
  const user = await getUserSession()
  const simulations = await getCompletedSimulations()

  return (
    <QueryClientProviderWrapper>
      <UserProvider serverSimulations={simulations} userSession={user}>
        {children}
      </UserProvider>
    </QueryClientProviderWrapper>
  )
}
