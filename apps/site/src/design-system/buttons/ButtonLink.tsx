'use client'

import Link from '@/components/Link'
import type { ButtonSize } from '@/types/values'
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
  colorClassNames,
  loaderColorMap,
  sizeClassNames,
} from './Button'
import { useButtonState } from './useButtonState'
import { twMerge } from "cn";

interface Props {
  href: string
  className?: string
  color?: ButtonColor
  size?: ButtonSize
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
      className={twMerge(
        `${baseClassNames} ${sizeClassNames[size]} ${colorClassNames[color]}`,
        isDisabled && 'cursor-not-allowed opacity-50!',
        className
      )}
      target={target}
      {...props}>
      {showLoader && (
        <Loader size="sm" color={loaderColorMap[color]} className="mr-2" />
      )}
      {children}
    </Link>
  )
}
