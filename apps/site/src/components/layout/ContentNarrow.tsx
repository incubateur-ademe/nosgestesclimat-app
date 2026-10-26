import Main from '@/design-system/layout/Main'
import type { PropsWithChildren } from 'react'
import { cn } from 'cn'

export default function ContentNarrow({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <Main
      className={cn(
        'my-8 w-full max-w-4xl overflow-visible px-4 pb-12 lg:mx-auto',
        className
      )}>
      {children}
    </Main>
  )
}
