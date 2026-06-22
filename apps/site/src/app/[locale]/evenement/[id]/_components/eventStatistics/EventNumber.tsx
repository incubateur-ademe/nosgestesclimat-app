'use client'

import type { Locale } from '@/i18nConfig'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  text: React.ReactNode
  locale: Locale
}

export default function EventNumber({ value, text, locale }: Props) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const hasAnimatedRef = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  const numberFormatter = useRef(new Intl.NumberFormat(locale))
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimatedRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasAnimatedRef.current = true

          const duration = 1000
          const startTime = performance.now()

          function animate(now: number) {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setAnimatedValue(Math.round(eased * value))
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate)
            }
          }

          rafRef.current = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return (
    <div ref={ref} className="flex-1 text-center text-white">
      <span className="block text-5xl font-bold tracking-tight md:text-6xl">
        {value === 0 ? '—' : numberFormatter.current.format(animatedValue)}
      </span>

      <span className="block text-center text-sm font-medium uppercase">
        {text}
      </span>
    </div>
  )
}
