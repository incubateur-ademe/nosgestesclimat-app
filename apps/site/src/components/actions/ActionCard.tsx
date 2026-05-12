import { ACTION_DETAIL_PATH } from '@/constants/urls/paths'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { ThemeBadge } from './ThemeBadge'

const classesByTheme: Record<Theme['key'], string> = {
  transport: 'border-transport-200 border-t-transport-400',
  food: 'border-alimentation-200 border-t-alimentation-400',
  housing: 'border-logement-200 border-t-logement-400',
  misc: 'border-divers-200 border-t-divers-400',
  societal_services:
    'border-servicessocietaux-200 border-t-servicessocietaux-400',
}

interface ActionCardProps extends React.ComponentPropsWithoutRef<'article'> {
  action: Action
}

export default function ActionCard({
  action,
  className,
  ...props
}: ActionCardProps) {
  return (
    <article
      {...props}
      className={twMerge(
        `relative flex min-h-56 flex-col gap-2 rounded-lg border border-t-8 bg-white p-2`,
        classesByTheme[action.theme.key],
        className
      )}>
      <ThemeBadge theme={action.theme} className="self-start" />
      <div className="grow">
        <h3 className="mb-0 text-base/normal font-bold">{action.title}</h3>
      </div>
      <Link
        href={ACTION_DETAIL_PATH.replace(':actionSlug', action.slug)}
        className="absolute inset-0 z-10">
        <span className="sr-only">Voir l'action "{action.title}"</span>
      </Link>
      {/* <div className="-mx-2 border-t border-slate-100 px-2 pt-2">
        <Button color="secondary" size="sm" className="w-full">
          <PlusIcon className="stroke-primary-700 mr-2 size-4 fill-none" />
          Ajouter
        </Button>
      </div> */}
    </article>
  )
}
