import { useEffect, useState } from 'react'

export default function useTimeLeft(second = 30) {
  const [timeLeft, setTimeLeft] = useState(second)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeleft) => (prevTimeleft > 0 ? prevTimeleft - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return { timeLeft, setTimeLeft }
}
