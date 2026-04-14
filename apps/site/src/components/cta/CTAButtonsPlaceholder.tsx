import { baseClassNames, colorClassNames } from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import { twMerge } from 'tailwind-merge'

export default function CTAButtonsPlaceholder({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={twMerge(
        'my-0 h-[56px] w-[260px]',
        className,
        baseClassNames,
        colorClassNames.primary
      )}>
      <Loader color="light" />
    </div>
  )
}
