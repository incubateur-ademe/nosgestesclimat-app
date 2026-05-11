'use client'

import ContentLarge from '@/components/layout/ContentLarge'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { usePathname } from 'next/navigation'
import TransitionButtons from './_components/TransitionButtons'
import TransitionHeaderSection from './_components/TransitionHeaderSection'

export default function IntercalaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const category = pathname.split('/').at(-1)

  return (
    <ContentLarge className="mt-8 mb-16 px-4">
      <TransitionHeaderSection category={category as DottedName} />
      <TransitionButtons category={category as DottedName} />
      {children}
    </ContentLarge>
  )
}
