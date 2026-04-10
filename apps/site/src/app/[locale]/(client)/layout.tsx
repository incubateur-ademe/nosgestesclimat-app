import Footer from '@/components/layout/Footer'
import HeaderServer from '@/components/layout/HeaderServer'
import { getUser } from '@/helpers/server/dal/user'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'
import { ClientLayout } from '../../../components/layout/ClientLayout'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function LargeLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  const { id: serverUserId } = await getUser()
  return (
    <>
      <ClientLayout locale={locale} serverUserId={serverUserId}>
        <HeaderServer locale={locale} />
        {children}
      </ClientLayout>
      <Footer backgroundColor="white" locale={locale} />
    </>
  )
}
