'use client'

import Trans from '@/components/translation/trans/TransClient'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface SecondsTimerProps {
  duration: number // duration in seconds
  onComplete: () => void
  className?: string
}

export default function SecondsTimer({
  duration,
  onComplete,
  className,
}: SecondsTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={twMerge('text-2xl font-bold', className)} role="timer">
      {formatTime(timeLeft)} <Trans>seconde</Trans>
      {timeLeft > 1 && 's'}
    </div>
  )
}
