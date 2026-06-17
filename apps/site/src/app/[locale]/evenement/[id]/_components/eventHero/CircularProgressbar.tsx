'use client'

import { useEffect, useRef, useState } from 'react'

const VIEWBOX = 100
const CENTER = 50
const STROKE_WIDTH = 8
const RADIUS = VIEWBOX / 2 - STROKE_WIDTH / 2
const DIAMETER = Math.PI * 2 * RADIUS

const PATH_D =
  `M ${CENTER},${CENTER} m 0,-${RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,${2 * RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,-${2 * RADIUS}`

interface Props {
  value: number
  startDelay?: number
}

export default function CircularProgressbar({ value, startDelay = 0 }: Props) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const startTime = performance.now()

      function animate(now: number) {
        const elapsed = now - startTime
        const t = Math.min(elapsed / 800, 1)
        setProgress(1 - Math.pow(1 - t, 3))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafRef.current)
    }
  }, [startDelay])

  const offset = (1 - (progress * value) / 100) * DIAMETER

  return (
    <svg className="CircularProgressbar" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
      <path
        d={PATH_D}
        stroke="#fde6f7"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        fill="none"
      />

      <path
        d={PATH_D}
        stroke="#d40d83"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${DIAMETER}px ${DIAMETER}px`}
        strokeDashoffset={`${offset}px`}
      />

      <text
        x={CENTER}
        y={CENTER + 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1a1a1a"
        fontSize="16"
        fontWeight="500">
        {Math.round(progress * value)}%
      </text>
    </svg>
  )
}
