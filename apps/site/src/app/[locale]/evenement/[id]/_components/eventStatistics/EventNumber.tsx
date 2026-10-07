'use client'

import type { Locale } from '@/i18nConfig'
import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  text: React.ReactNode
  locale: Locale
}

export default function EventNumber({ value, text, locale }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const [displayedValue, setDisplayedValue] = useState(value)
  const numberFormatter = useRef(new Intl.NumberFormat(locale))

  useEffect(() => {
    if (!inView) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedValue(value)
      return
    }

    const controls = animate(0, value, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayedValue(Math.round(v)),
    })

    return () => controls.stop()
  }, [inView, value])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex-1 text-center text-white">
      <span className="block text-5xl font-bold tracking-tight md:text-6xl">
        {numberFormatter.current.format(displayedValue)}
      </span>
      <span className="block text-center text-sm font-medium uppercase">
        {text}
      </span>
    </div>
  )
}
