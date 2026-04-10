import React from 'react'
import { twMerge } from 'tailwind-merge'

export default function SquareImageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={twMerge(
        'relative flex aspect-square w-full items-center justify-center',
        className
      )}>
      {children}
    </div>
  )
}
