import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
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
        `relative flex min-h-56 flex-col gap-2.5 rounded-[10px] border border-t-8 ${classesByTheme[action.theme.key]} bg-white p-2.5`,
        className
      )}>
      <ThemeBadge theme={action.theme} className="self-start" />
      <div className="grow">
        <h3 className="mb-0 text-base leading-6 font-bold">{action.title}</h3>
      </div>
      {/* <div className="-mx-2.5 border-t border-slate-100 px-2.5 pt-2.5">
        <Button color="secondary" size="sm" className="w-full">
          <PlusIcon className="stroke-primary-700 mr-2 size-4 fill-none" />
          Ajouter
        </Button>
      </div> */}
    </article>
  )
}
