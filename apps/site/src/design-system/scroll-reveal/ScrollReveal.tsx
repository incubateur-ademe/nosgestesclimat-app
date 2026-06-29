'use client'

import { motion } from 'framer-motion'
import useScrollReveal from './useScrollReveal'

type ChildrenFn = (inView: boolean) => React.ReactNode

interface Props {
  /**
   * When a function: render-prop receiving `inView` for full control.
   * When a ReactNode: wrapped in a default slide-from-right animation.
   */
  children: React.ReactNode | ChildrenFn
  className?: string
}

export default function ScrollReveal({ children, className }: Props) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>()

  return (
    <div ref={ref} className={className}>
      {typeof children === 'function' ? (
        children(inView)
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, ease: 'easeOut' }}>
          {children}
        </motion.div>
      )}
    </div>
  )
}
