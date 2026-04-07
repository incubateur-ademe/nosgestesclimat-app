import EngineProviders from '@/components/providers/EngineProviders'
import { getUser } from '@/helpers/server/dal/user'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'
import { ClientLayout } from '../../../components/layout/ClientLayout'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function SimulateurLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params
  const { id: serverUserId } = await getUser()

  return (
    <ClientLayout
      skipLinksDisplayed={new Set(['main', 'footer'])}
      locale={locale}
      serverUserId={serverUserId}>
      <EngineProviders>{children}</EngineProviders>
    </ClientLayout>
  )
}
