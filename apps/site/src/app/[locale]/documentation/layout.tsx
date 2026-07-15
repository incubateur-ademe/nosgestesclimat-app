import { ClientLayout } from '@/components/layout/ClientLayout'
import ContentLarge from '@/components/layout/ContentLarge'
import Footer from '@/components/layout/Footer'
import HeaderServer from '@/components/layout/HeaderServer'
import { pickLanguageSwitchParams } from '@/helpers/language/pickLanguageSwitchParams'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'
import { IsDocumentationClientProvider } from './_contexts/DocumentationStateContext'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function Layout({ children, params }: LayoutProps) {
  const { locale, ...routeParams } = await params
  const userSession = await getUserSession()

  return (
    <>
      <HeaderServer
        locale={locale}
        params={pickLanguageSwitchParams(routeParams)}
      />
      <ClientLayout locale={locale} userSession={userSession}>
        <IsDocumentationClientProvider>
          <ContentLarge tag="div">{children}</ContentLarge>
          <Footer locale={locale} />
        </IsDocumentationClientProvider>
      </ClientLayout>
    </>
  )
}
