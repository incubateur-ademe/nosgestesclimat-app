import Emoji, { type EmojiProps } from '@/design-system/utils/Emoji'
import type { ThemeKey } from '@nosgestesclimat/core/features/actions/types/theme'
import { twMerge } from 'tailwind-merge'

type EmojiBadgeColor = 'default' | ThemeKey

type EmojiBadgeProps = EmojiProps & {
  color?: EmojiBadgeColor
}

export function EmojiBadge({
  className,
  children,
  color = 'default',
  ...props
}: EmojiBadgeProps) {
  return (
    <Emoji
      {...props}
      className={twMerge(
        'flex size-7 items-center justify-center rounded-lg border bg-white text-base leading-none shadow-md',
        classesByColor[color],
        className
      )}>
      {children}
    </Emoji>
  )
}

const classesByColor: Record<EmojiBadgeColor, string> = {
  default: 'bg-secondary-50 border-slate-200',
  food: 'bg-white border-alimentation-200',
  transport: 'bg-white border-transport-200',
  societal_services: 'bg-white border-servicessocietaux-200',
  housing: 'bg-white border-logement-200',
  misc: 'bg-white border-divers-200',
}
