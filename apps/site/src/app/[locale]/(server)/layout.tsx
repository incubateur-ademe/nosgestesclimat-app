import { GoogleTagIframe } from '@/components/googleTagManager/GoogleTagIframe'
import { GoogleTagScript } from '@/components/googleTagManager/GoogleTagScript'
import HeaderServer from '@/components/layout/HeaderServer'
import SkipToMainContentLink from '@/design-system/accessibility/SkipToMainContentLink'
import Banner from '@/design-system/cms/Banner'
import { pickLanguageSwitchParams } from '@/helpers/language/pickLanguageSwitchParams'
import type { Locale } from '@/i18nConfig'

export default async function LargeLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale, ...routeParams } = await params
  return (
    <>
      <SkipToMainContentLink />
      <Banner locale={locale as Locale} />
      <HeaderServer
        locale={locale}
        params={pickLanguageSwitchParams(routeParams)}
      />
      {children}
      <GoogleTagScript />
      <GoogleTagIframe />
    </>
  )
}
