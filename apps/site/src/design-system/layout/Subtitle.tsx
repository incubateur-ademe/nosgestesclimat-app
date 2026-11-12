import { cn } from 'cn'
import type { HTMLAttributes } from 'react'

export type SubtitleProps = HTMLAttributes<HTMLParagraphElement>

export default function Subtitle({
  className = '',
  children,
  ...props
}: SubtitleProps) {
  return (
    <p className={cn('text-slate-500', className)} {...props}>
      {children}
    </p>
  )
}
