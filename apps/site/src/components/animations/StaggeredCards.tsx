'use client'

import useScrollReveal from '@/design-system/scroll-reveal/useScrollReveal'
import { motion } from 'framer-motion'
import React from 'react'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

export default function StaggeredCards({
  children,
}: {
  children: React.ReactNode
}) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>()

  return (
    <div ref={ref}>
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.05 },
          },
        }}
        className="flex flex-col gap-4 md:flex-row md:gap-6">
        {React.Children.map(children, (child) => (
          <motion.div variants={itemVariants}>{child}</motion.div>
        ))}
      </motion.div>
    </div>
  )
}
