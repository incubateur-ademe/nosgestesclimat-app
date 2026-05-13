'use client'
import ContentLarge from '@/components/layout/ContentLarge'
import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import { useFormState } from '@/publicodes-state'
import type { Categories } from '@incubateur-ademe/nosgestesclimat/types/categories'
import TransitionButtons from './_components/TransitionButtons'
import TransitionHeaderSection from './_components/TransitionHeaderSection'

export default function IntercalaireLayout({
  children,
}: LayoutProps<'/[locale]/simulateur/intercalaire'>) {
  const { currentCategory, isInitialized, isFirstQuestionOfCategory } =
    useFormState()

  return (
    <ContentLarge className="mt-8 mb-16 px-4">
      {!isInitialized || isFirstQuestionOfCategory ? (
        <>
          <BlockSkeleton className="h-12 w-64" />
          <div className="inline-flex gap-4">
            <BlockSkeleton className="h-12 w-40" />
            <BlockSkeleton className="h-12 w-56" />
          </div>
        </>
      ) : (
        <>
          <TransitionHeaderSection
            previousCategory={currentCategory as Categories}
          />
          <TransitionButtons />
        </>
      )}

      {children}
    </ContentLarge>
  )
}
