import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { getUser } from '@/helpers/server/dal/user'
import { UserProvider } from '@/publicodes-state'

export default async function Layout({
  children,
}: LayoutProps<'/[locale]/amis'>) {
  const { id: initialUserId } = await getUser()

  return (
    <QueryClientProviderWrapper>
      <UserProvider serverUserId={initialUserId}>{children}</UserProvider>
    </QueryClientProviderWrapper>
  )
}
