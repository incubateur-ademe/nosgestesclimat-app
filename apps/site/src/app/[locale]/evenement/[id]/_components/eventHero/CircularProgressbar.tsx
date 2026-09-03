'use client'

import { twMerge } from 'tailwind-merge'
import {
  CENTER,
  DIAMETER,
  FULL_CIRCLE_PATH_D,
  STROKE_WIDTH,
  useAnimateCircularProgressbar,
  VIEWBOX,
} from './circularProgressbar/useAnimateCircularProgressbar'

interface Props {
  value: number
  startDelay?: number
}

const GRADIENT_ID = 'circular-progressbar-overflowing'

export default function CircularProgressbar({ value, startDelay = 0 }: Props) {
  const {
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
  } = useAnimateCircularProgressbar({ value, startDelay })

  return (
    <svg
      role="img"
      aria-label={`${displayedValue}%`}
      className={twMerge(
        'w-full max-w-40',
        // displayedValue >= 100 &&
        'animate-[bg-pulse_3s_ease-in-out_forwards'
      )}
      overflow="visible"
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
      {/* Track */}
      <path
        d={FULL_CIRCLE_PATH_D}
        stroke="#fde6f7"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        fill="none"
      />

      {/*
       * Default progress circle
       */}

      <path
        d={FULL_CIRCLE_PATH_D}
        stroke="#d40d83"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${DIAMETER}px ${DIAMETER}px`}
        strokeDashoffset={`${offset}px`}
      />

      {/*
       * Overflow mode default circle: the track continues its way over the
       * first 100% colored track
       */}
      {isOverflow && displayedValue >= 100 && (
        <>
          <defs>
            {/*
             * Radial purple / red gradient
             */}
            {gradientImage && (
              <pattern
                id={GRADIENT_ID}
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
                      dur={4_000}
                      repeatCount="indefinite"
                    />
                  )}
                </image>
              </pattern>
            )}

            <filter
              id={`${GRADIENT_ID}-shadow`}
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
          {/* Rainbow trace on top of the border. */}
          <path
            d={progressPathD}
            stroke={`url(#${GRADIENT_ID})`}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${pathLength}px ${pathLength}px`}
            strokeDashoffset={`${offset}px`}
          />

          {/*
           * Tip cap: the curved front part of the bar end to make visible the
           * overlapping bar tip
           */}

          <path
            d={tipCapD}
            fill="none"
            stroke="#ffffff"
            strokeWidth={0.5}
            transform={`rotate(${tipRotation} ${tipX} ${tipY})`}
            filter={`url(#${GRADIENT_ID}-shadow)`}
          />
        </>
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
