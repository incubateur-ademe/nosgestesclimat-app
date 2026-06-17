'use client'

import Link from '@/components/Link'
import type { ButtonSize } from '@/types/values'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import {
  useState,
  type HtmlHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PropsWithChildren,
} from 'react'
import { twMerge } from 'tailwind-merge'
import Loader from '../layout/Loader'
import type { ButtonColor } from './Button'
import {
  baseClassNames,
  colorClassNames,
  loaderColorMap,
  loaderSizeMap,
  sizeClassNames,
} from './Button'

interface Props {
  href: string
  className?: string
  color?: ButtonColor
  size?: ButtonSize
  title?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLAnchorElement>) => void
  trackingEvent?: (string | null)[]
  target?: string
  loading?: boolean
  disabled?: boolean
  isClickableOnce?: boolean
}

export default function ButtonLink({
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
  loading,
  disabled,
  isClickableOnce = false,
  ...props
}: PropsWithChildren<Props & HtmlHTMLAttributes<HTMLAnchorElement>>) {
  const [isClicked, setIsClicked] = useState(false)

  const isDisabled = disabled || loading || (isClickableOnce && isClicked)

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault()
          return
        }

        // Auto-disable link after click
        if (isClickableOnce) setIsClicked(true)

        if (onClick) {
          onClick(e)
        }
        if (trackingEvent) {
          trackMatomoEvent__deprecated(trackingEvent)
        }
      }}
      onKeyDown={(e) => {
        if (isDisabled) {
          return
        }
        if (onKeyDown) {
          onKeyDown(e)
        }

        if (trackingEvent) {
          trackMatomoEvent__deprecated(trackingEvent)
        }
      }}
      title={title}
      aria-disabled={isDisabled}
      className={twMerge(
        `${baseClassNames} ${sizeClassNames[size]} ${colorClassNames[color]}`,
        isDisabled && 'cursor-not-allowed opacity-50!',
        className
      )}
      target={target}
      {...props}>
      {(loading || (isClickableOnce && isClicked)) && (
        <Loader
          size={loaderSizeMap[size]}
          color={loaderColorMap[color]}
          className="mr-2"
        />
      )}
      {children}
    </Link>
  )
}
