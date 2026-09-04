import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'
import { ClientLayout } from '../../../components/layout/ClientLayout'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function LargeLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  const userSession = await getUserSession()
  return (
    <>
      <ClientLayout locale={locale} userSession={userSession}>
        <Header locale={locale} />
        {children}
      </ClientLayout>
      <Footer backgroundColor="white" locale={locale} />
    </>
  )
}
