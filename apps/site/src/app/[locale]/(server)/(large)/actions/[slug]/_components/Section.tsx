import { EmojiBadge } from '@/components/actions/EmojiBadge'
import { twMerge } from 'tailwind-merge'

type SectionVariant = 'default' | 'highlighted'

interface SectionProps extends React.ComponentPropsWithoutRef<'section'> {
  variant?: SectionVariant
}

export function Section({
  variant = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={twMerge(
        'rounded-2xl border border-slate-200 p-5 md:p-10',
        sectionClassNamesByVariant[variant],
        className
      )}
      {...props}>
      {children}
    </section>
  )
}

const sectionClassNamesByVariant: Record<SectionVariant, string> = {
  default: 'bg-white',
  highlighted: 'bg-slate-50',
}

interface SectionTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  emoji: string
}

export function SectionTitle({
  className,
  children,
  emoji,
  ...props
}: SectionTitleProps) {
  return (
    <h2
      className={twMerge(
        'mb-5 flex items-center gap-1 text-lg/normal font-bold',
        className
      )}
      {...props}>
      <EmojiBadge>{emoji}</EmojiBadge>
      {children}
    </h2>
  )
}
