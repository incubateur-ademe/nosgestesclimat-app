import { ClientLayout } from '@/components/layout/ClientLayout'
import ContentLarge from '@/components/layout/ContentLarge'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'
import { IsDocumentationClientProvider } from './_contexts/DocumentationStateContext'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function Layout({ children, params }: LayoutProps) {
  const { locale } = await params
  const userSession = await getUserSession()

  return (
    <>
      <Header locale={locale} />
      <ClientLayout locale={locale} userSession={userSession}>
        <IsDocumentationClientProvider>
          <ContentLarge tag="div">{children}</ContentLarge>
          <Footer locale={locale} />
        </IsDocumentationClientProvider>
      </ClientLayout>
    </>
  )
}
