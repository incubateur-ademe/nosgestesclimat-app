import React from 'react'
import { cn } from 'cn'

export default function MaxWidthContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('mt-6 w-full', className)}>
      <div className="mx-auto max-w-5xl px-6 lg:px-0">{children}</div>
    </section>
  )
}
