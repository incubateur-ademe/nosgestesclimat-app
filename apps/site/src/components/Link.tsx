'use client'

import { getLocalizedPath } from '@/helpers/navigation/simulateurPages'
import { useLocale } from '@/hooks/useLocale'
import NextLink from 'next/link'
import type {
  HTMLAttributes,
  MouseEventHandler,
  PropsWithChildren,
} from 'react'
import { twMerge } from 'tailwind-merge'

export interface LinkProps extends PropsWithChildren<
  HTMLAttributes<HTMLAnchorElement>
> {
  href: string
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  title?: string
  target?: string
}

function sanitizeHref(rawHref: string): string {
  const value = rawHref.trim()

  if (!value) return '/'

  const lowerValue = value.toLowerCase()
  if (
    lowerValue.startsWith('javascript:') ||
    lowerValue.startsWith('data:') ||
    lowerValue.startsWith('vbscript:')
  ) {
    return '/'
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('#')
  ) {
    return value
  }

  const path = value.startsWith('/') ? value : `/${value}`
  const [pathname, queryAndHash] = path.split(/(?=[?#])/, 2)
  const safePathname = pathname
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/')

  return `${safePathname}${queryAndHash || ''}`
}

export default function Link({
  children,
  href,
  className,
  onClick,
  title,
  target,
  ...props
}: LinkProps) {
  const locale = useLocale()
  const safeHref = sanitizeHref(href)
  const localizedHref = getLocalizedPath(safeHref, locale)

  return (
    <NextLink
      href={localizedHref}
      className={twMerge(
        'text-primary-700 hover:text-primary-800 break-words underline transition-colors',
        className
      )}
      onClick={onClick}
      title={title}
      target={target}
      {...props}>
      {children}
    </NextLink>
  )
}
