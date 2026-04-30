import Emoji from '@/design-system/utils/Emoji'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import ActionCard from './ActionCard'

const classesByTheme: Record<
  Theme['key'],
  Record<'section' | 'emoji', string>
> = {
  transport: {
    section: 'bg-transport-50 border-transport-200',
    emoji: 'border-transport-200',
  },
  food: {
    section: 'bg-alimentation-50 border-alimentation-200',
    emoji: 'border-alimentation-200',
  },
  housing: {
    section: 'bg-logement-50 border-logement-200',
    emoji: 'border-logement-200',
  },
  misc: {
    section: 'bg-divers-50 border-divers-200',
    emoji: 'border-divers-200',
  },
  societal_services: {
    section: 'bg-services-societaux-50 border-services-societaux-200',
    emoji: 'border-services-societaux-200',
  },
}

export default function ThemeSection({
  theme,
  actions,
}: {
  theme: Theme
  actions: Action[]
}) {
  const classes = classesByTheme[theme.key]
  return (
    <section
      className={`-mx-4 border-t-2 border-b-2 px-2.5 py-5 md:mx-0 md:rounded-[20px] md:border-2 md:px-5 md:py-7.5 ${classes.section}`}>
      <div className="mb-5 flex items-start justify-between gap-2">
        <div className="flex items-start gap-1">
          <Emoji
            className={`flex size-7.5 items-center justify-center rounded-lg border bg-white text-base leading-none shadow-md ${classes.emoji}`}>
            {theme.emoji}
          </Emoji>
          <div>
            <h2 className="mb-0 text-lg leading-6.75 font-bold">
              {theme.title}
            </h2>
            <p className="text-sm leading-5.25 font-normal">
              {actions.length} actions recommandées
            </p>
          </div>
        </div>
      </div>
      <div className="-mr-2.5 flex gap-2.5 overflow-x-auto pr-5 pb-1 md:mr-0">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            className="w-55 shrink-0 md:w-62"
          />
        ))}
      </div>
    </section>
  )
}
