'use client'

import NextLink from 'next/link'
import type { MouseEventHandler } from 'react'
import { twMerge } from 'tailwind-merge'

export interface LinkProps extends React.ComponentProps<typeof NextLink> {
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
  return (
    <NextLink
      href={href}
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
