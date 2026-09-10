import MainHooks from '@/app/[locale]/_components/mainLayoutProviders/MainHooks'
import { GoogleTagIframe } from '@/components/googleTagManager/GoogleTagIframe'
import { GoogleTagScript } from '@/components/googleTagManager/GoogleTagScript'
import Header from '@/components/layout/Header'
import SkipToMainContentLink from '@/design-system/accessibility/SkipToMainContentLink'
import Banner from '@/design-system/cms/Banner'
import type { Locale } from '@/i18nConfig'
import { Suspense } from 'react'

export default async function LargeLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  return (
    <>
      <MainHooks />
      <SkipToMainContentLink />
      <Suspense fallback={null}>
        <Banner locale={locale as Locale} />
      </Suspense>
      <Header locale={locale} />
      {children}
      <GoogleTagScript />
      <GoogleTagIframe />
    </>
  )
}
