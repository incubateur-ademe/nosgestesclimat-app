import { twMerge } from 'tailwind-merge'

export default function Separator({
  className = '',
  ...props
}: {
  className?: string
  [key: string]: unknown
}) {
  return (
    <div
      className={twMerge(
        'bg-secondary-500 my-8 h-[3px] w-12 rounded-full md:w-20',
        className
      )}
      {...props}
    />
  )
}
