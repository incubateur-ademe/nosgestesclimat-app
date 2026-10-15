import React from 'react'
import { cn } from 'cn'

export default function SquareImageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-square w-full items-center justify-center',
        className
      )}>
      {children}
    </div>
  )
}
