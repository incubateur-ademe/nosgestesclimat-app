import ContentLarge from '@/components/layout/ContentLarge'
import Header from '@/components/layout/Header'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params

  return (
    <>
      <Header locale={locale} />
      <ContentLarge className="px-4 lg:px-0">{children}</ContentLarge>
    </>
  )
}
