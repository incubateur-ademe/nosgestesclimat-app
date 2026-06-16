'use client'

import useScrollReveal from '@/design-system/scroll-reveal/useScrollReveal'
import { motion } from 'framer-motion'
import React from 'react'

/** Wrappe le bloc compteur avec une animation verticale au scroll, décalée de 1.5s */
export default function AnimatedCounterBlock({
  children,
}: {
  children: React.ReactNode
}) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>()

  return (
    <div ref={ref} className="flex-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 1.5 }}>
        {children}
      </motion.div>
    </div>
  )
}
