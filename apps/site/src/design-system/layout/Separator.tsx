import { twMerge } from 'tailwind-merge'

type SeparatorVariant = 'short' | 'full'

interface SeparatorProps extends React.ComponentPropsWithoutRef<'div'> {
  variant?: SeparatorVariant
}

export default function Separator({
  className = '',
  variant = 'short',
  ...props
}: SeparatorProps) {
  return (
    <div
      className={twMerge(classNamesByVariant[variant], className)}
      {...props}
    />
  )
}

const classNamesByVariant: Record<SeparatorVariant, string> = {
  short: 'bg-secondary-500 my-8 h-[3px] w-12 rounded-full md:w-20',
  full: 'h-px bg-slate-200',
}
