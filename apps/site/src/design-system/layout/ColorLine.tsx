import { twMerge } from 'tailwind-merge'

export default function ColorLine({
  className,
  ...props
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return <div className={twMerge('bg-secondary-700', className)} {...props} />
}
