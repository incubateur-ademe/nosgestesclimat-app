import ContentLarge from '@/components/layout/ContentLarge'
import TransitionHeaderSection from './_components/TransitionHeaderSection'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ContentLarge className="mt-8 mb-16 px-4">
      <TransitionHeaderSection />
      {children}
    </ContentLarge>
  )
}
