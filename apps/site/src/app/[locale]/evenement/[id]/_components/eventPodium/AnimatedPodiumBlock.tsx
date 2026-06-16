'use client'

import useScrollReveal from '@/design-system/scroll-reveal/useScrollReveal'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const RANK_DELAY: Record<number, number> = {
  1: 0,
  2: 0.12,
  3: 0.24,
}

/** Transition douce et progressive */
const DESKTOP_TRANSITION = {
  duration: 1,
  ease: [0.25, 0.1, 0.25, 1] as const,
  delay: 0,
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
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  // Détection du breakpoint côté client uniquement
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const delay = RANK_DELAY[rank] ?? 0

  // Pendant le SSR / premier rendu, on ne fait aucune animation
  // (évite un flash dû au décalage serveur/client)
  if (isDesktop === null) {
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
          transition={{ ...DESKTOP_TRANSITION, delay }}
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
