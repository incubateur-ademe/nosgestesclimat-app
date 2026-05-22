'use client'
import { usePathname } from 'next/navigation'
import SimulateurLayout from './(root)/bilan/_components/SimulateurLayout'
import SimulateurSkeleton from './(root)/bilan/_components/skeleton'

export default function Loading() {
  const pathname = usePathname()

  if (!pathname.endsWith('/simulateur/bilan')) {
    return null
  }
  return (
    <SimulateurLayout>
      <SimulateurSkeleton />
    </SimulateurLayout>
  )
}
