import type { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  type: 'vertical' | 'horizontal'
  value: string
  index?: number
  color?: string
  className?: string
  delay?: number
  width?: number
}

export default function BarChart({
  type,
  value,
  delay = 0.5,
  color,
  className,
  width,
}: Props) {
  const propertyAffected = type === 'vertical' ? 'height' : 'width'

  return (
    <div
      className={twMerge(
        `max-w-full min-w-0 ${propertyAffected === 'width' ? 'h-4' : 'w-4'} ${
          color ?? 'bg-secondary-700'
        } rotate-180 rounded-xl motion-reduce:animate-none ${
          propertyAffected === 'width'
            ? 'animate-bar-grow-horizontal w-0 motion-reduce:w-[var(--target-value)]'
            : 'animate-bar-grow-vertical h-0 motion-reduce:h-[var(--target-value)]'
        }`,
        className
      )}
      style={
        {
          '--target-value': value,
          [propertyAffected === 'width' ? 'height' : 'width']: width
            ? `${width}px`
            : undefined,
          animationDelay: `${delay}s`,
        } as CSSProperties
      }
    />
  )
}
