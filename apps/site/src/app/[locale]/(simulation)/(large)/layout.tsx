import ContentLarge from '@/components/layout/ContentLarge'
import HeaderServer from '@/components/layout/HeaderServer'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/personas' | '/[locale]/tutoriel'>) {
  const { locale } = await params

  return (
    <>
      <HeaderServer locale={locale} />
      <ContentLarge className="mt-4 px-4 md:mt-10 lg:px-0">
        {children}
      </ContentLarge>
    </>
  )
}
