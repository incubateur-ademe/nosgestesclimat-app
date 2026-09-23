import ContentLarge from '@/components/layout/ContentLarge'
import Header from '@/components/layout/Header'

export default function Layout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <>
      <Header />
      <ContentLarge className="px-4 lg:px-0">{children}</ContentLarge>
    </>
  )
}
