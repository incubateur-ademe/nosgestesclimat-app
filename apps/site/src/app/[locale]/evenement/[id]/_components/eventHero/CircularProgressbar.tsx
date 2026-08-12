'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'

const VIEWBOX = 100
const CENTER = 50
const STROKE_WIDTH = 8
const RADIUS = VIEWBOX / 2 - STROKE_WIDTH / 2
const DIAMETER = Math.PI * 2 * RADIUS

// White border stroke width (the rainbow trace is drawn on top of it).
const FULL_CIRCLE_PATH_D =
  `M ${CENTER},${CENTER} m 0,-${RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,${2 * RADIUS}` +
  ` a ${RADIUS},${RADIUS} 0 1 1 0,-${2 * RADIUS}`

// Same colors as the `bg-rainbow` utility (see globals.css).
const RAINBOW_COLORS = ['#a2d2fd', '#cef1d5', '#ffefbc', '#ffdbbc', '#fd69d0']

const RAINBOW_ANIMATION_DURATION = '12s'

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Renders a conic (radial) gradient of the rainbow palette on a canvas and
// returns it as a data URL, so it can be used as an SVG pattern fill.
function buildConicGradientDataUrl(size = 256): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const cx = size / 2
  const cy = size / 2

  // Paint one triangle per small angular step to fake a conic gradient.
  const steps = 360
  const colorStops = RAINBOW_COLORS
  for (let step = 0; step < steps; step++) {
    const angle = (step / steps) * Math.PI * 2
    const nextAngle = ((step + 1) / steps) * Math.PI * 2
    const position = step / steps

    // Interpolate the rainbow color at this angle.
    const t = position * colorStops.length
    const index = Math.floor(t) % colorStops.length
    const nextIndex = (index + 1) % colorStops.length
    const local = t - Math.floor(t)
    const from = hexToRgb(colorStops[index])
    const to = hexToRgb(colorStops[nextIndex])
    const r = Math.round(from[0] + (to[0] - from[0]) * local)
    const g = Math.round(from[1] + (to[1] - from[1]) * local)
    const b = Math.round(from[2] + (to[2] - from[2]) * local)

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    // Extend well beyond the canvas so the whole circle is covered.
    const far = size
    ctx.lineTo(cx + Math.cos(angle) * far, cy + Math.sin(angle) * far)
    ctx.lineTo(cx + Math.cos(nextAngle) * far, cy + Math.sin(nextAngle) * far)
    ctx.closePath()
    ctx.fill()
  }

  return canvas.toDataURL('image/png')
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

interface Props {
  value: number
  startDelay?: number
}

export default function CircularProgressbar({ value, startDelay = 0 }: Props) {
  const [progress, setProgress] = useState(0)
  const displayedValue = Math.round(progress * value)
  const rafRef = useRef<number>(0)
  const gradientId = useId().replace(/:/g, '')
  const isReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  )

  // Conic gradient painted once, reused as the trace fill. The lazy
  // initializer keeps the canvas work out of render and runs only on client.
  const [gradientImage] = useState(() =>
    typeof window === 'undefined' ? '' : buildConicGradientDataUrl()
  )

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

  return (
    <svg
      role="img"
      aria-label={`${displayedValue}%`}
      className="CircularProgressbar"
      overflow="visible"
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
      {isOverflow && (
        <defs>
          {/*
           * Radial rainbow gradient, painted as a conic gradient image and
           * used as the trace fill. It rotates around the ring center so the
           * color follows the progression, like the animated bg-rainbow.
           */}
          {gradientImage && (
            <pattern
              id={gradientId}
              patternUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={VIEWBOX}
              height={VIEWBOX}>
              <image
                href={gradientImage}
                x="0"
                y="0"
                width={VIEWBOX}
                height={VIEWBOX}
                preserveAspectRatio="none">
                {!isReducedMotion && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${CENTER} ${CENTER}`}
                    to={`360 ${CENTER} ${CENTER}`}
                    dur={RAINBOW_ANIMATION_DURATION}
                    repeatCount="indefinite"
                  />
                )}
              </image>
            </pattern>
          )}

          <filter
            id={`${gradientId}-shadow`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.5"
              floodColor="#000000"
              floodOpacity="0.35"
            />
          </filter>
        </defs>
      )}

      {/* Track */}
      <path
        d={FULL_CIRCLE_PATH_D}
        stroke="#fde6f7"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        fill="none"
      />

      {isOverflow && (
        <>
          {/* Rainbow trace on top of the border. */}
          <path
            d={progressPathD}
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${pathLength}px ${pathLength}px`}
            strokeDashoffset={`${offset}px`}
          />
          {/*
           * Tip cap: the curved front part of the bar end, as a transparent
           * half-ring with only a white stroke, pointing in the direction of
           * the progression. It carries the drop shadow and marks where the
           * bar on top overlaps the lap underneath.
           */}
          <path
            d={tipCapD}
            fill="none"
            stroke="#ffffff"
            strokeWidth={0.5}
            transform={`rotate(${tipRotation} ${tipX} ${tipY})`}
            filter={`url(#${gradientId}-shadow)`}
          />
          <path
            d={tipCapD}
            fill="none"
            stroke="#ffffff"
            strokeWidth={0.5}
            transform={`rotate(${tipRotation} ${tipX} ${tipY})`}
            filter={`url(#${gradientId}-shadow)`}
          />
        </>
      )}

      {!isOverflow && (
        <path
          d={FULL_CIRCLE_PATH_D}
          stroke="#d40d83"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${DIAMETER}px ${DIAMETER}px`}
          strokeDashoffset={`${offset}px`}
        />
      )}

      <text
        x={CENTER}
        y={CENTER + 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1a1a1a"
        fontSize="16"
        fontWeight="500">
        {displayedValue}%
      </text>
    </svg>
  )
}
