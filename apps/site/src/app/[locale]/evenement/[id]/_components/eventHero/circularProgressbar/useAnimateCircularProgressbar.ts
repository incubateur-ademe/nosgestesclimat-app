import { useEffect, useRef, useState } from 'react'
import { buildConicGradientDataUrl, getReducedMotionSnapshot } from './utils'

interface Props {
  value: number
  startDelay: number
}

export const VIEWBOX = 100
export const CENTER = 50
export const STROKE_WIDTH = 8
const RADIUS = VIEWBOX / 2 - STROKE_WIDTH / 2
export const DIAMETER = Math.PI * 2 * RADIUS

// White border stroke width (the rainbow trace is drawn on top of it).
export const FULL_CIRCLE_PATH_D =
  `M ${CENTER},${CENTER} m 0,-${RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,${2 * RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,-${2 * RADIUS}`

export function useAnimateCircularProgressbar({
  value: temp,
  startDelay,
}: Props) {
  const value = 120
  const [progress, setProgress] = useState(0)
  const displayedValue = Math.round(progress * value)
  const requestAnimationFrameRef = useRef<number>(0)
  const isReducedMotion = getReducedMotionSnapshot()

  // Conic gradient painted once, reused as the trace fill. The lazy
  // initializer keeps the canvas work out of render
  const [gradientImage] = useState(() => buildConicGradientDataUrl())

  const isOverflow = value > 100

  // The whole progression lives on one single ring. Above 100%, the trace
  // starts a new lap on top of the previous one (same lane), drawn again so it
  // overlaps visually. Each lap is a full circle appended to the path.
  const totalLaps = progress * (isOverflow ? value / 100 : 0)
  const lapCount = Math.max(Math.ceil(totalLaps), 1)

  let progressPathD = ''
  for (let lap = 0; lap < lapCount; lap++) {
    progressPathD += FULL_CIRCLE_PATH_D
  }
  const pathLength = lapCount * DIAMETER
  const offset = isOverflow
    ? (1 - progress) * pathLength
    : (1 - (progress * value) / 100) * DIAMETER

  // Position of the tip of the trace, clockwise from the top. The white tip
  // cap (and its shadow) is drawn here to mark the level difference between
  // the lap below and the lap on top.
  const tipAngle = ((progress * value) / 100) * 2 * Math.PI
  const tipX = CENTER + RADIUS * Math.sin(tipAngle)
  const tipY = CENTER - RADIUS * Math.cos(tipAngle)

  // Half-ring at the tip: only the curved front part of the rounded bar end,
  // as a white stroke (transparent inside), pointing in the direction of the
  // progression. It borders where the bar on top overlaps the lap underneath,
  // and carries the drop shadow.
  //
  // The arc is built in a frame centered on the tip, spanning the front half
  // of a circle (from -90° to +90° in screen coords, so it bulges towards +x),
  // then rotated by the progression angle so the bulge follows the bar.
  const tipRadius = STROKE_WIDTH / 2
  const tipRotation = (tipAngle * 180) / Math.PI
  const tipCapD =
    `M ${tipX.toFixed(2)},${(tipY - tipRadius).toFixed(2)}` +
    ` A ${tipRadius},${tipRadius} 0 0 1 ${tipX.toFixed(2)},${(tipY + tipRadius).toFixed(2)}`

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const startTime = performance.now()

      function animate(now: number) {
        const elapsed = now - startTime
        const t = Math.min(elapsed / 3800, 1)
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
  console.log({ progress })
  return {
    displayedValue,
    isOverflow,
    gradientImage,
    isReducedMotion,
    offset,
    progressPathD,
    pathLength,
    tipCapD,
    tipRotation,
    tipX,
    tipY,
  }
}
