import Link from '@/design-system/links/Link'
import { cn } from 'cn'
import type { LinkProps } from 'next/link'
import type { HtmlHTMLAttributes, PropsWithChildren } from 'react'
import {
  baseClassNames,
  getVariantClassNames,
  sizeClassNames,
  type ButtonColor,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'

interface Props {
  href: string
  className?: string
  color?: ButtonColor
  size?: ButtonSize
  variant?: ButtonVariant
  title?: string
  target?: string
  prefetch?: LinkProps['prefetch']
  disabled?: boolean
}

export default function ButtonLinkServer({
  href,
  children,
  className = '',
  color = 'primary',
  size = 'md',
  variant = 'filled',
  title,
  target = '_self',
  disabled,
  ...props
}: PropsWithChildren<Props & HtmlHTMLAttributes<HTMLAnchorElement>>) {
  const classNames = cn(
    baseClassNames,
    sizeClassNames[size],
    getVariantClassNames(variant, color),
    disabled && 'cursor-not-allowed opacity-50!',
    className
  )

  // An anchor without href is neither focusable nor clickable
  if (disabled) {
    return (
      <a aria-disabled title={title} className={classNames} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      title={title}
      className={cn(
        baseClassNames,
        sizeClassNames[size],
        getVariantClassNames(variant, color),
        className
      )}
      target={target}
      {...props}>
      {children}
    </Link>
  )
}
