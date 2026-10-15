'use client'

import Card from '@/design-system/layout/Card'
import type { PropsWithChildren } from 'react'
import { cn } from 'cn'

interface Props {
  className?: string
}
export default function VerticalBarChart({
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Card
      className={cn(
        'mt-4 flex w-full justify-end rounded-xl border-none bg-gray-100 p-3 shadow-none',
        className
      )}>
      <ul className="flex h-full items-end justify-between">{children}</ul>
    </Card>
  )
}
