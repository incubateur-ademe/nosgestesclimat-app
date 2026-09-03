'use client'

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
      className="w-full max-w-40"
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

      {/*
       * Overflow mode default circle: the track continues its way over the
       * first 100% colored track
       */}
      {isOverflow && (
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
            filter={`url(#${GRADIENT_ID}-shadow)`}
          />
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
