'use client'

import DotIcon from '@/components/icons/DotIcon'
import WaterDropIcon from '@/components/icons/WaterDropIcon'
import Trans from '@/components/translation/trans/TransClient'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export default function FloatingInfo({
  title,
  carbonScore,
  waterScore,
  className,
  orientation = 'right',
}: {
  title: ReactNode
  carbonScore?: number
  waterScore?: number
  className?: string
  orientation?: 'left' | 'right'
}) {
  return (
    <div
      aria-hidden
      className={twMerge(
        'absolute w-36 -translate-y-[120%] rounded-xl bg-white px-3 py-2 shadow-lg md:-translate-y-1/2',
        orientation === 'left'
          ? '-translate-x-[80%] md:-translate-x-[110%]'
          : 'md:translate-x-[30%]',
        className
      )}>
      <p className="text-primary-600 mb-0 text-sm font-bold">{title}</p>

      {waterScore ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="text-primary-600">
            <Trans>Eau</Trans>
          </div>
          <div className="-mr-[3px] flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <WaterDropIcon
                key={index}
                className={twMerge(
                  'h-4 w-4 fill-blue-600',
                  index + 1 > (waterScore ?? 0) ? 'fill-gray-300' : ''
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      {carbonScore ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="text-primary-600">
            <Trans>CO₂e</Trans>
          </div>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <DotIcon
                key={index}
                className={twMerge(
                  'h-4 w-4',
                  index + 1 > (carbonScore ?? 0) ? 'fill-gray-300' : ''
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
