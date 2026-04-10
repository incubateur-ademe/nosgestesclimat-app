import { ClientLayout } from '@/components/layout/ClientLayout'
import ContentLarge from '@/components/layout/ContentLarge'
import Footer from '@/components/layout/Footer'
import HeaderServer from '@/components/layout/HeaderServer'
import { getUser } from '@/helpers/server/dal/user'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'
import { IsDocumentationClientProvider } from './_contexts/DocumentationStateContext'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function Layout({ children, params }: LayoutProps) {
  const { locale } = await params
  const { id: serverUserId } = await getUser()

  return (
    <>
      <HeaderServer locale={locale} />
      <ClientLayout locale={locale} serverUserId={serverUserId}>
        <IsDocumentationClientProvider>
          <ContentLarge tag="div">{children}</ContentLarge>
          <Footer locale={locale} />
        </IsDocumentationClientProvider>
      </ClientLayout>
    </>
  )
}
