import Emoji from '@/design-system/utils/Emoji'
import type { Theme } from '@/types/themes'
import { twMerge } from 'tailwind-merge'

const classesByTheme: Record<Theme['key'], string> = {
  transport: 'bg-transport-50 text-transport-800',
  food: 'bg-alimentation-50 text-alimentation-800',
  housing: 'bg-logement-50 text-logement-800',
  misc: 'bg-divers-50 text-divers-800',
  societal_services: 'bg-servicessocietaux-50 text-servicessocietaux-800',
}

interface ThemeBadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  theme: Pick<Theme, 'key' | 'emoji' | 'title'>
}

export function ThemeBadge({ theme, className, ...props }: ThemeBadgeProps) {
  return (
    <span
      {...props}
      className={twMerge(
        `inline-flex items-center gap-0.5 rounded px-2 py-1 text-sm font-bold whitespace-nowrap ${classesByTheme[theme.key]}`,
        className
      )}>
      <Emoji>{theme.emoji}</Emoji> {theme.title}
    </span>
  )
}
