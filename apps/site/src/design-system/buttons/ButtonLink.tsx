'use client'

import Link from '@/components/Link'
import { cn } from 'cn'
import type { LinkProps } from 'next/link'
import {
  type HtmlHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PropsWithChildren,
} from 'react'
import Loader from '../layout/Loader'
import type { ButtonColor } from './Button'
import {
  baseClassNames,
  getVariantClassNames,
  loaderColorMap,
  sizeClassNames,
} from './Button'
import type { ButtonSize, ButtonVariant } from './buttonStyles'
import { useButtonState } from './useButtonState'

interface Props {
  href: string
  className?: string
  color?: ButtonColor
  size?: ButtonSize
  variant?: ButtonVariant
  title?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLAnchorElement>) => void
  target?: string
  scroll?: boolean
  prefetch?: LinkProps['prefetch']
  loading?: boolean
  disabled?: boolean
  showLoadingOnClick?: boolean
}

export default function ButtonLink({
  href,
  children,
  className = '',
  color = 'primary',
  size = 'md',
  variant = 'filled',
  title,
  onClick,
  onKeyDown,
  target = '_self',
  scroll = true,
  loading,
  disabled,
  showLoadingOnClick = false,
  ...props
}: PropsWithChildren<Props & HtmlHTMLAttributes<HTMLAnchorElement>>) {
  const { isDisabled, showLoader, clickOnce } = useButtonState({
    disabled,
    loading,
    showLoadingOnClick,
  })

  return (
    <Link
      scroll={scroll}
      href={href}
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault()
          return
        }

        // Auto-disable link after click
        if (showLoadingOnClick) clickOnce()

        if (onClick) {
          onClick(e)
        }
      }}
      onKeyDown={(e) => {
        if (isDisabled) {
          return
        }
        if (onKeyDown) {
          onKeyDown(e)
        }
      }}
      title={title}
      aria-disabled={isDisabled}
      className={cn(
        `${baseClassNames} ${sizeClassNames[size]} ${getVariantClassNames(variant, color)}`,
        isDisabled && 'cursor-not-allowed opacity-50!',
        className
      )}
      target={target}
      {...props}>
      {showLoader && (
        <Loader size="sm" color={loaderColorMap[variant]} className="mr-2" />
      )}
      {children}
    </Link>
  )
}
