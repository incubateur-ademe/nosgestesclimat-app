import { twMerge } from 'tailwind-merge'

interface Props {
  className: string
}

export default function TransitionInfoCard({ className }: Props) {
  return (
    <div
      className={twMerge(
        'mt-6 w-full rounded-2xl border-2 border-slate-200 p-6 shadow-sm md:mt-8',
        className
      )}></div>
  )
}
