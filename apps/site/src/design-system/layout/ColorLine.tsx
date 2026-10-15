import { cn } from 'cn'

export default function ColorLine({
  className,
  ...props
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return <div className={cn('bg-secondary-700', className)} {...props} />
}
