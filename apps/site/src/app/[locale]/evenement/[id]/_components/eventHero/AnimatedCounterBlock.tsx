'use client'

import useScrollReveal from '@/design-system/scroll-reveal/useScrollReveal'
import { motion } from 'framer-motion'
import React from 'react'

const COUNTER_BLOCK_ANIMATION_DELAY = 1500

const COUNTER_BLOCK_ANIMATION_DURATION = 500

export const COUNTER_BLOCK_ANIMATION_TOTAL =
  COUNTER_BLOCK_ANIMATION_DELAY + COUNTER_BLOCK_ANIMATION_DURATION

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
        transition={{
          duration: COUNTER_BLOCK_ANIMATION_DURATION / 1000,
          ease: 'easeOut',
          delay: COUNTER_BLOCK_ANIMATION_DELAY / 1000,
        }}>
        {children}
      </motion.div>
    </div>
  )
}
