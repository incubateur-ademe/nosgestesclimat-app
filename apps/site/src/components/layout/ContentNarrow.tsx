import Main from '@/design-system/layout/Main'
import type { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export default function ContentNarrow({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <Main
      className={twMerge(
        'my-8 w-full max-w-4xl overflow-visible px-4 pb-12 lg:mx-auto',
        className
      )}>
      {children}
    </Main>
  )
}
