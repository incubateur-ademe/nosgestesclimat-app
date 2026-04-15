import ContentLarge from '@/components/layout/ContentLarge'

export default async function NoChromeLayout({
  children,
}: LayoutProps<'/[locale]'>) {
  return (
    <ContentLarge className="mt-4 px-4 md:mt-10 lg:px-0">
      {children}
    </ContentLarge>
  )
}
