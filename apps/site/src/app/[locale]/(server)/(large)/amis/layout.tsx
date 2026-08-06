import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/auth/get-user-session'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'

export default async function Layout({
  children,
}: LayoutProps<'/[locale]/amis'>) {
  const user = await getUserSession()
  const [simulation] = await getCompletedSimulations({ pageSize: 1 })

  return (
    <QueryClientProviderWrapper>
      <UserProvider simulation={simulation} userSession={user}>
        {children}
      </UserProvider>
    </QueryClientProviderWrapper>
  )
}
