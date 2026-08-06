import { GoogleTagIframe } from '@/components/googleTagManager/GoogleTagIframe'
import { GoogleTagScript } from '@/components/googleTagManager/GoogleTagScript'
import Header from '@/components/layout/Header'
import SkipToMainContentLink from '@/design-system/accessibility/SkipToMainContentLink'
import Banner from '@/design-system/cms/Banner'
import type { Locale } from '@/i18nConfig'

export default async function LargeLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  return (
    <>
      <SkipToMainContentLink />
      <Banner locale={locale as Locale} />
      <Header locale={locale} />
      {children}
      <GoogleTagScript />
      <GoogleTagIframe />
    </>
  )
}
