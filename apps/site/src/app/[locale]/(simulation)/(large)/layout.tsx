import HeaderServer from '@/components/layout/HeaderServer'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/personas' | '/[locale]/tutoriel'>) {
  const { locale } = await params

  return (
    <>
      <HeaderServer locale={locale} />

      {children}
    </>
  )
}
