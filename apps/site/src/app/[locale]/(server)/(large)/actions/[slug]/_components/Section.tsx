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
        'rounded-[20px] border border-slate-200 p-5 md:p-10',
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

type SectionTitleProps = React.ComponentPropsWithoutRef<'h2'>

export function SectionTitle({
  className,
  children,
  ...props
}: SectionTitleProps) {
  return (
    <h2
      className={twMerge('mb-5 text-lg leading-6.75 font-bold', className)}
      {...props}>
      {/* TODO: emoji */}
      {children}
    </h2>
  )
}
