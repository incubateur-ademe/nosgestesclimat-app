'use client'

import { useLocale } from '@/hooks/useLocale'
import i18nConfig from '@/i18nConfig'
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
  const localizedHref =
    href.startsWith('/') && locale !== i18nConfig.defaultLocale
      ? href === '/'
        ? `/${locale}`
        : `/${locale}${href}`
      : href

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
