import Link from '@/design-system/links/Link'
import type { ButtonSize } from '@/types/values'
import type { LinkProps } from 'next/link'
import type { HtmlHTMLAttributes, PropsWithChildren } from 'react'
import { baseClassNames, colorClassNames, sizeClassNames } from './buttonStyles'
import { twMerge } from "cn";

interface Props {
  href: string
  className?: string
  color?: 'primary' | 'secondary' | 'text' | 'success'
  size?: ButtonSize
  title?: string
  target?: string
  prefetch?: LinkProps['prefetch']
}

export default function ButtonLinkServer({
  href,
  children,
  className = '',
  color = 'primary',
  size = 'md',
  title,
  target = '_self',
  ...props
}: PropsWithChildren<Props & HtmlHTMLAttributes<HTMLAnchorElement>>) {
  return (
    <Link
      href={href}
      title={title}
      className={twMerge(
        `${baseClassNames} ${sizeClassNames[size]} ${colorClassNames[color]}`,
        className
      )}
      target={target}
      {...props}>
      {children}
    </Link>
  )
}
