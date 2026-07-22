'use client'

import { useEffect, useState } from 'react'

export function useSecondsLeft(deadline: number): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (deadline <= Date.now()) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [deadline])

  return Math.max(0, Math.ceil((deadline - now) / 1000))
}
