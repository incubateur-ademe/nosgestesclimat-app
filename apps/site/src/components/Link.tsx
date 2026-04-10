'use client'

import NextLink from 'next/link'
import type {
  HTMLAttributes,
  MouseEventHandler,
  PropsWithChildren,
} from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
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
}: PropsWithChildren<HTMLAttributes<HTMLAnchorElement> & Props>) {
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
      prefetch={true}
      {...props}>
      {children}
    </NextLink>
  )
}
