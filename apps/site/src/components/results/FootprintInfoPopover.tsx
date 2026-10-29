'use client'

import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/shadcn/popover'
import { cn } from 'cn'
import { Globe, Info } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

interface Props {
  className?: string
  label: string
  title: ReactNode
  children: ReactNode
  /** Shown next to the title, as an element: a server component cannot hand
   * a component over to this client one */
  icon?: ReactNode
  side?: ComponentProps<typeof PopoverContent>['side']
  align?: ComponentProps<typeof PopoverContent>['align']
  alignOffset?: number
  /** Points at the button, for a popover opened beside it */
  withArrow?: boolean
}

export default function FootprintInfoPopover({
  className,
  label,
  title,
  children,
  icon = <Globe aria-hidden="true" className="size-5" />,
  side,
  align = 'start',
  alignOffset,
  withArrow = false,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            'focus-visible:ring-primary-700 hover:text-primary-700 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
            className
          )}>
          <Info aria-hidden="true" className="size-5.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={16}
        aria-label={label}
        className="border-primary-200 text-default w-88 max-w-[calc(100vw-2rem)] gap-0 rounded-2xl border bg-white p-0 shadow-xl ring-0">
        <div className="bg-primary-50 border-primary-100 flex items-center gap-3 rounded-t-2xl border-b px-5 py-4">
          <span className="bg-primary-100 text-primary-700 flex size-10 shrink-0 items-center justify-center rounded-full">
            {icon}
          </span>

          <p className="mb-0 text-base leading-snug font-bold">{title}</p>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 text-slate-600">
          {children}
        </div>

        {/* Level with the button, inside the header: same colour */}
        {withArrow && (
          <PopoverArrow width={16} height={8} className="fill-primary-50" />
        )}
      </PopoverContent>
    </Popover>
  )
}
