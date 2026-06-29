'use client'

import useScrollReveal from '@/design-system/scroll-reveal/useScrollReveal'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const RANK_DELAY: Record<number, number> = {
  1: 0,
  2: 0.12,
  3: 0.24,
}

const MOBILE_TRANSITION = {
  duration: 0.5,
  ease: 'easeOut' as const,
  delay: 0,
}

export default function AnimatedPodiumBlock({
  children,
  rank,
}: {
  children: React.ReactNode
  rank: number
}) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>()
  const [isDesktop, setIsDesktop] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    setHydrated(true)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const delay = RANK_DELAY[rank] ?? 0

  // Avoid hydration mismatch: render static content on first render
  if (!hydrated) {
    return (
      <div ref={ref}>
        <div>{children}</div>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <div ref={ref}>
        <motion.div
          initial={{ height: 0 }}
          animate={inView ? { height: 'auto' } : { height: 0 }}
          transition={{
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1] as const,
            delay,
          }}
          className="overflow-hidden">
          {children}
        </motion.div>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ ...MOBILE_TRANSITION, delay }}>
        {children}
      </motion.div>
    </div>
  )
}
