import ContentLarge from '@/components/layout/ContentLarge'
import Footer from '@/components/layout/Footer'
import type { Locale } from '@/i18nConfig'

export default async function LargeLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  return (
    <>
      <ContentLarge className="mt-4 px-4 md:mt-10 lg:px-0">
        {children}
      </ContentLarge>

      <Footer locale={locale as Locale} />
    </>
  )
}
