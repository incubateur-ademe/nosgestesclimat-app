'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/shadcn/popover'
import { twMerge } from 'cn'
import { Globe, Info } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  className?: string
  label: string
  title: ReactNode
  children: ReactNode
}

export default function FootprintInfoPopover({
  className,
  label,
  title,
  children,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={twMerge(
            'focus-visible:ring-primary-700 hover:text-primary-700 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
            className
          )}>
          <Info aria-hidden="true" className="size-5.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        collisionPadding={16}
        aria-label={label}
        className="border-primary-200 text-default w-88 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-2xl border bg-white p-0 shadow-xl ring-0">
        <div className="bg-primary-50 border-primary-100 flex items-center gap-3 border-b px-5 py-4">
          <span className="bg-primary-100 text-primary-700 flex size-10 shrink-0 items-center justify-center rounded-full">
            <Globe aria-hidden="true" className="size-5" />
          </span>

          <p className="mb-0 text-base leading-snug font-bold">{title}</p>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 text-slate-600">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}
