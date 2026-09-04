import { useEffect, useRef, useState } from 'react'
import {
  buildConicGradientDataUrl,
  getBarTipValues,
  getComputedValues,
  getReducedMotionSnapshot,
} from './utils'

interface Props {
  value: number
  startDelay: number
}

export const VIEWBOX = 100
export const CENTER = 50
export const STROKE_WIDTH = 10
const RADIUS = VIEWBOX / 2 - STROKE_WIDTH / 2
export const CIRCUMFERENCE = Math.PI * 2 * RADIUS
const FULL_PERCENTAGE = 100
const ANIMATION_DURATION = 3000

// White border stroke width (the rainbow trace is drawn on top of it).
export const FULL_CIRCLE_PATH_D =
  `M ${CENTER},${CENTER} m 0,-${RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,${2 * RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,-${2 * RADIUS}`

// Conic gradient painted once, reused as the trace fill. The lazy
// initializer keeps the canvas work out of render
const gradientImage = buildConicGradientDataUrl()

export function useAnimateCircularProgressbar({ value, startDelay }: Props) {
  const [progress, setProgress] = useState(0)
  const displayedValue = Math.round(progress * value)
  const requestAnimationFrameRef = useRef<number>(0)
  const isReducedMotion = getReducedMotionSnapshot()

  const isOverflow = value >= FULL_PERCENTAGE

  const { pathLength, progressPathD, offsetSingleLap, offsetOverflow } =
    getComputedValues({
      progress,
      value,
      isOverflow,
      circumference: CIRCUMFERENCE,
      fullCirclePathD: FULL_CIRCLE_PATH_D,
    })

  const { tipCapD, tipRotation, tipX, tipY } = getBarTipValues({
    center: CENTER,
    radius: RADIUS,
    progress,
    value,
    strokeWidth: STROKE_WIDTH,
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const startTime = performance.now()

      function animate(now: number) {
        const elapsed = now - startTime
        const t = Math.min(elapsed / ANIMATION_DURATION, 1)
        setProgress(1 - Math.pow(1 - t, 3))
        if (t < 1) {
          requestAnimationFrameRef.current = requestAnimationFrame(animate)
        }
      }

      requestAnimationFrameRef.current = requestAnimationFrame(animate)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(requestAnimationFrameRef.current)
    }
  }, [startDelay])

  return {
    displayedValue,
    isOverflow,
    gradientImage,
    isReducedMotion,
    offsetSingleLap,
    offsetOverflow,
    progressPathD,
    pathLength,
    tipCapD,
    tipRotation,
    tipX,
    tipY,
    progress,
  }
}
