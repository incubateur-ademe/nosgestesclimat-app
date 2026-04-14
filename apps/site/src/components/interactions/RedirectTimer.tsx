'use client'

import { isServerSide } from '@/utils/nextjs/isServerSide'
import { useRouter } from 'next/navigation'
import SecondsTimer from './SecondsTimer'

export default function RedirectTimer({
  href,
  className,
  duration = 20,
}: {
  href: string
  className?: string
  duration?: number
}) {
  const router = useRouter()

  const handleNavigation = () => {
    // Use internal routing if local route
    if (href.startsWith('/')) {
      router.push(href)
      return
    }

    if (isServerSide()) return

    window.location.href = href
  }

  return (
    <SecondsTimer
      duration={duration}
      onComplete={handleNavigation}
      className={className}
    />
  )
}
