import { GoogleTagIframe } from '@/components/googleTagManager/GoogleTagIframe'
import { GoogleTagScript } from '@/components/googleTagManager/GoogleTagScript'
import HeaderServer from '@/components/layout/HeaderServer'
import SkipToMainContentLink from '@/design-system/accessibility/SkipToMainContentLink'
import Banner from '@/design-system/cms/Banner'
import type { Locale } from '@/i18nConfig'
import { MotionConfig } from 'framer-motion'

export default async function LargeLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  return (
    <>
      <SkipToMainContentLink />
      <Banner locale={locale as Locale} />
      <HeaderServer locale={locale} />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <GoogleTagScript />
      <GoogleTagIframe />
    </>
  )
}
