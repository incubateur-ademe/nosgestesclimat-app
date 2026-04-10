import Link from '@/components/Link'
import type { HTMLAttributes, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  href: string
  className?: string
  title?: string
  onClick?: () => void
  target?: string
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
      className={twMerge(
        `text-primary-700 hover:text-primary-700! inline-block underline transition-colors`,
        className
      )}
      {...props}>
      {children}
    </Link>
  )
}
