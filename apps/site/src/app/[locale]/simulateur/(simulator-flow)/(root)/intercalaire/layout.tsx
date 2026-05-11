'use client'

import ContentLarge from '@/components/layout/ContentLarge'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { usePathname, useRouter } from 'next/navigation'
import TransitionButtons from './_components/TransitionButtons'
import TransitionHeaderSection from './_components/TransitionHeaderSection'
import { orderedCategoriesWithoutServices } from './_constants/getOrderedCategoriesWithoutServices'

export default function IntercalaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const router = useRouter()

  const category = pathname.split('/').at(-1)

  if (
    !category ||
    !orderedCategoriesWithoutServices.includes(category as DottedName)
  ) {
    router.push(SIMULATOR_PATH)
  }

  return (
    <ContentLarge className="mt-8 mb-16 px-4">
      <TransitionHeaderSection category={category as DottedName} />
      <TransitionButtons category={category as DottedName} />
      {children}
    </ContentLarge>
  )
}
