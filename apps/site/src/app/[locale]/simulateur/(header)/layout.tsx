import ContentLarge from '@/components/layout/ContentLarge'
import HeaderServer from '@/components/layout/HeaderServer'
import { pickLanguageSwitchParams } from '@/helpers/language/pickLanguageSwitchParams'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale, ...routeParams } = await params

  return (
    <>
      <HeaderServer
        locale={locale}
        params={pickLanguageSwitchParams(routeParams)}
      />
      <ContentLarge className="px-4 lg:px-0">{children}</ContentLarge>
    </>
  )
}
