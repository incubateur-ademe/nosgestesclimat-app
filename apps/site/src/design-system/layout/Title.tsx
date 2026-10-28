import { cn } from 'cn'
import type { HTMLAttributes, PropsWithChildren } from 'react'

type Sizes = 'xl' | 'lg' | 'md'

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: Sizes
}

export const titleSizesClassNames: Record<Sizes, string> = {
  xl: 'text-3xl font-bold md:text-4xl mb-8',
  lg: 'text-2xl font-medium md:text-3xl mb-6',
  md: 'text-xl font-normal md:text-2xl mb-6',
}

export default function Title({
  tag = 'h1',
  className = '',
  children,
  size = 'md',
  ...props
}: PropsWithChildren<TitleProps>) {
  const Tag = tag
  return (
    <Tag className={cn(titleSizesClassNames[size], className)} {...props}>
      {children}
    </Tag>
  )
}
