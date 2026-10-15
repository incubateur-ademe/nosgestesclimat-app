import Link from '@/components/Link'
import type { LinkProps } from 'next/link'
import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from 'cn'

type Props = {
  href: string
  className?: string
  title?: string
  onClick?: () => void
  target?: string
  prefetch?: LinkProps['prefetch']
} & PropsWithChildren &
  HTMLAttributes<HTMLAnchorElement>

export default function InlineLink({
  children,
  href,
  className,
  title,
  onClick,
  ...props
}: Props) {
  return (
    <Link
      href={href}
      title={title}
      onClick={onClick}
      className={cn(
        `text-primary-700 hover:text-primary-700! inline-block underline transition-colors`,
        className
      )}
      {...props}>
      {children}
    </Link>
  )
}
