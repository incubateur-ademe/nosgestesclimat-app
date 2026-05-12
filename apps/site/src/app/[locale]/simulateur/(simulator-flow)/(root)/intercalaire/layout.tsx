import ContentLarge from '@/components/layout/ContentLarge'
import TransitionButtons from './_components/TransitionButtons'
import TransitionHeaderSection from './_components/TransitionHeaderSection'

export default function IntercalaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ContentLarge className="mt-8 mb-16 px-4">
      <TransitionHeaderSection />
      <TransitionButtons />
      {children}
    </ContentLarge>
  )
}
