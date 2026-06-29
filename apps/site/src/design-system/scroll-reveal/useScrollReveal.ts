'use client'

import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function useScrollReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return { ref, inView }
}
