'use client'

import { useEffect, useRef, useState } from 'react'

const VIEWBOX_WIDTH = 100
const VIEWBOX_HEIGHT = 100
const VIEWBOX_HEIGHT_HALF = 50
const VIEWBOX_CENTER_X = 50
const VIEWBOX_CENTER_Y = 50

function getPathDescription(pathRadius: number) {
  const radius = pathRadius
  return `
      M ${VIEWBOX_CENTER_X},${VIEWBOX_CENTER_Y}
      m 0,-${radius}
      a ${radius},${radius} 0 1 1 0,${2 * radius}
      a ${radius},${radius} 0 1 1 0,-${2 * radius}
    `
}

function getDashStyle(pathRadius: number, dashRatio: number) {
  const diameter = Math.PI * 2 * pathRadius
  const gapLength = (1 - dashRatio) * diameter
  return {
    strokeDasharray: `${diameter}px ${diameter}px`,
    strokeDashoffset: `${gapLength}px`,
  }
}

interface Props {
  value: number
  minValue?: number
  maxValue?: number
  strokeWidth?: number
  background?: boolean
  backgroundPadding?: number
  circleRatio?: number
  className?: string
  startDelay?: number
}

export default function CircularProgressbar({
  value,
  minValue = 0,
  maxValue = 100,
  strokeWidth = 8,
  background = false,
  backgroundPadding = 0,
  circleRatio = 1,
  className = '',
  startDelay = 0,
}: Props) {
  const pathRadius = VIEWBOX_HEIGHT_HALF - strokeWidth / 2 - backgroundPadding

  const boundedValue = Math.min(Math.max(value, minValue), maxValue)
  const pathRatio = (boundedValue - minValue) / (maxValue - minValue)

  const [animationProgress, setAnimationProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const duration = 800
      const startTime = performance.now()

      function animate(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimationProgress(eased)
        if (progress < 1) {
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
      className={`CircularProgressbar ${className}`}
      style={{ width: '100%', verticalAlign: 'middle' }}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      data-test-id="CircularProgressbar">
      {background && (
        <circle
          className="CircularProgressbar-background"
          style={{ fill: '#d6d6d6' }}
          cx={VIEWBOX_CENTER_X}
          cy={VIEWBOX_CENTER_Y}
          r={VIEWBOX_HEIGHT_HALF}
        />
      )}
      <path
        className="CircularProgressbar-trail"
        style={{
          stroke: '#fde6f7',
          strokeLinecap: 'round',
          ...getDashStyle(pathRadius, circleRatio),
        }}
        d={getPathDescription(pathRadius)}
        strokeWidth={strokeWidth}
        fillOpacity={0}
      />
      <path
        className="CircularProgressbar-path"
        style={{
          stroke: '#d40d83',
          strokeLinecap: 'round',
          ...getDashStyle(
            pathRadius,
            animationProgress * pathRatio * circleRatio
          ),
        }}
        d={getPathDescription(pathRadius)}
        strokeWidth={strokeWidth}
        fillOpacity={0}
      />

      <text
        className="CircularProgressbar-text"
        style={{
          fill: '#1a1a1a',
          fontSize: '16px',
          fontWeight: '500',
          dominantBaseline: 'middle',
          textAnchor: 'middle',
        }}
        x={VIEWBOX_CENTER_X}
        y={VIEWBOX_CENTER_Y + 4}>
        {`${Math.round(animationProgress * boundedValue)}%`}
      </text>
    </svg>
  )
}
