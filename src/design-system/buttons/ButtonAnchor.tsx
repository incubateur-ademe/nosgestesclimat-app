'use client'

import type { ButtonSize } from '@/types/values'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type {
  HtmlHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  PropsWithChildren,
} from 'react'
import { twMerge } from 'tailwind-merge'
import { baseClassNames, colorClassNames, sizeClassNames } from './Button'

interface Props {
  href: string
  className?: string
  color?: 'primary' | 'secondary' | 'text' | 'success'
  size?: ButtonSize
  title?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLAnchorElement>) => void
  trackingEvent?: (string | null)[]
  target?: string
}

export default function ButtonAnchor({
  href,
  children,
  className = '',
  color = 'primary',
  size = 'md',
  title,
  onClick,
  onKeyDown,
  trackingEvent,
  target = '_self',
  ...props
}: PropsWithChildren<Props & HtmlHTMLAttributes<HTMLAnchorElement>>) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        }
        if (trackingEvent) {
          trackMatomoEvent__deprecated(trackingEvent)
        }
      }}
      onKeyDown={(e) => {
        if (onKeyDown) {
          onKeyDown(e)
        }

        if (trackingEvent) {
          trackMatomoEvent__deprecated(trackingEvent)
        }
      }}
      title={title}
      className={twMerge(
        `${baseClassNames} ${sizeClassNames[size]} ${colorClassNames[color]}`,
        className
      )}
      target={target}
      {...props}>
      {children}
    </a>
  )
}
