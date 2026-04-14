import React from 'react'
import { twMerge } from 'tailwind-merge'

export default function MaxWidthContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={twMerge('mt-6 w-full', className)}>
      <div className="mx-auto max-w-5xl px-6 lg:px-0">{children}</div>
    </section>
  )
}
