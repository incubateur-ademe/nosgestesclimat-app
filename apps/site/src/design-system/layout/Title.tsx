import type { HTMLAttributes, JSX, PropsWithChildren } from 'react'

import { twMerge } from 'tailwind-merge'
import Separator from './Separator'

type Sizes = 'xl' | 'lg' | 'md'

export interface TitleProps extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  'title'
> {
  title?: string | JSX.Element
  subtitle?: string | JSX.Element
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  hasSeparator?: boolean
  containerClassName?: string
  size?: Sizes
}

export const titleSizesClassNames: Record<Sizes, string> = {
  xl: 'text-3xl font-bold md:text-4xl',
  lg: 'text-2xl font-medium md:text-3xl',
  md: 'text-xl font-normal md:text-2xl',
}

export default function Title({
  title,
  subtitle,
  tag = 'h1',
  hasSeparator = true,
  className = '',
  containerClassName,
  children,
  size = 'md',
  ...props
}: PropsWithChildren<TitleProps>) {
  const Tag = tag
  return (
    <div className={twMerge('relative', containerClassName)}>
      <div className={hasSeparator ? 'mb-6' : ''}>
        <Tag
          className={twMerge('mb-2', titleSizesClassNames[size], className)}
          {...props}>
          {title ?? children}
        </Tag>

        {subtitle && <p className="mb-0 text-slate-500">{subtitle}</p>}
      </div>
      {hasSeparator ? <Separator className="mt-0 mb-6" /> : null}
    </div>
  )
}
