import MainHooks from '@/app/[locale]/_components/mainLayoutProviders/MainHooks'
import { GoogleTagIframe } from '@/components/googleTagManager/GoogleTagIframe'
import { GoogleTagScript } from '@/components/googleTagManager/GoogleTagScript'
import HeaderServer from '@/components/layout/HeaderServer'
import SkipToMainContentLink from '@/design-system/accessibility/SkipToMainContentLink'
import BannerClient from '@/design-system/cms/BannerClient'

export default async function LargeLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  return (
    <>
      <MainHooks />
      <SkipToMainContentLink />
      <BannerClient locale={locale} />
      <HeaderServer locale={locale} />
      {children}
      <GoogleTagScript />
      <GoogleTagIframe />
    </>
  )
}
