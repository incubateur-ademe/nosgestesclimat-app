import ContentLarge from '@/components/layout/ContentLarge'
import HeaderServer from '@/components/layout/HeaderServer'

export default function Layout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <>
      <HeaderServer />
      <ContentLarge className="px-4 lg:px-0">{children}</ContentLarge>
    </>
  )
}
