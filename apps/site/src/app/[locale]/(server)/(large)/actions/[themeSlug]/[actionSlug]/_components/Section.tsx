import type { BadgeColor } from '@/design-system/layout/Badge'
import Badge from '@/design-system/layout/Badge'
import { twMerge } from 'tailwind-merge'

type SectionProps = React.ComponentPropsWithoutRef<'section'>

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={twMerge(
        'rounded-2xl border border-slate-200 bg-white p-5 md:p-10',
        className
      )}
      {...props}>
      {children}
    </section>
  )
}

interface SectionTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  color: BadgeColor
}

export function SectionTitle({
  className,
  children,
  color,
  ...props
}: SectionTitleProps) {
  return (
    <Badge
      tag="h2"
      color={color}
      border={false}
      className={twMerge('mb-5', className)}
      {...props}>
      {children}
    </Badge>
  )
}
