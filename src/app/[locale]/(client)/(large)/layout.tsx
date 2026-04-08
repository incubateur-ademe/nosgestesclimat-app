import ContentLarge from '@/components/layout/ContentLarge'

export default function LargeLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <ContentLarge className="mt-4 px-4 md:mt-10 lg:px-0">
      {children}
    </ContentLarge>
  )
}
