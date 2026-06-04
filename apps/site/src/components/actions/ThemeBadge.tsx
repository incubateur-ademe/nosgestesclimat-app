import Badge from '@/design-system/layout/Badge'
import type { Theme } from '@/types/themes'
import { twMerge } from 'tailwind-merge'

const classesByTheme: Record<Theme['key'], string> = {
  transport: 'bg-transport-50 text-transport-800',
  food: 'bg-alimentation-50 text-alimentation-800',
  housing: 'bg-logement-50 text-logement-800',
  misc: 'bg-divers-50 text-divers-800',
  societal_services: 'bg-servicessocietaux-50 text-servicessocietaux-800',
}

interface ThemeBadgeProps extends Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'color'
> {
  theme: Pick<Theme, 'key' | 'emoji' | 'title'>
}

export function ThemeBadge({ theme, className, ...props }: ThemeBadgeProps) {
  return (
    <Badge
      className={twMerge(classesByTheme[theme.key], className)}
      border={false}
      {...props}>
      {theme.title}
    </Badge>
  )
}
