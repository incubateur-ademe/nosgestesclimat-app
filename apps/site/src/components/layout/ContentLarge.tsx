import Main from '@/design-system/layout/Main'
import type { HTMLAttributes, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

type ContentLargeProps = HTMLAttributes<HTMLDivElement> &
  PropsWithChildren<{
    ref?: React.RefObject<HTMLDivElement | null>
    className?: string
    tag?: React.ElementType
  }>

export default function ContentLarge({
  ref,
  children,
  className,
  tag = Main,
  ...props
}: ContentLargeProps) {
  const Tag = tag

  return (
    <Tag
      className={twMerge(
        'flex w-full max-w-5xl flex-1 flex-col overflow-visible lg:mx-auto',
        className
      )}
      ref={ref}
      {...props}>
      {children}
    </Tag>
  )
}
