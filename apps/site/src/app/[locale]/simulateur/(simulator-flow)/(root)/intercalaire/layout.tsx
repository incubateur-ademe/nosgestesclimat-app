'use client'
import { useFormAdvancement } from '@/form-controller'
import ContentLarge from '@/components/layout/ContentLarge'
import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import TransitionButtons from './_components/TransitionButtons'
import TransitionHeaderSection from './_components/TransitionHeaderSection'

export default function IntercalaireLayout({
  children,
}: LayoutProps<'/[locale]/simulateur/intercalaire'>) {
  const { currentQuestion, currentCategory, isInitialized } =
    useFormAdvancement()

  return (
    <ContentLarge className="mt-8 mb-16 px-4">
      {!isInitialized || !currentQuestion ? (
        <>
          <BlockSkeleton className="h-12 w-64" />
          <div className="inline-flex gap-4">
            <BlockSkeleton className="h-12 w-40" />
            <BlockSkeleton className="h-12 w-56" />
          </div>
        </>
      ) : (
        <>
          <TransitionHeaderSection previousCategory={currentCategory} />
          <TransitionButtons />
        </>
      )}

      {children}
    </ContentLarge>
  )
}
