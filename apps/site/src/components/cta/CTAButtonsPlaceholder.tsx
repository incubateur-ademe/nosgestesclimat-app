import {
  baseClassNames,
  getVariantClassNames,
} from '@/design-system/buttons/buttonStyles'
import Loader from '@/design-system/layout/Loader'
import { cn } from 'cn'

export default function CTAButtonsPlaceholder({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        'my-0 h-14 w-65',
        className,
        baseClassNames,
        getVariantClassNames('filled', 'primary')
      )}>
      <Loader color="light" />
    </div>
  )
}
