import { cn } from 'cn'

interface Props {
  value: number
  className?: string
}

export default function CountBadge({ value, className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-primary-600 flex size-8 items-center justify-center rounded-full text-sm font-bold text-white',
        className
      )}>
      {value}
    </div>
  )
}
