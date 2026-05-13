import Emoji from '@/design-system/utils/Emoji'
import type { Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import Trans from '../translation/trans/TransServer'
import ActionCard from './ActionCard'
import ActionsCarousel from './ActionsCarousel/ActionsCarousel'

const classesByTheme: Record<
  Theme['key'],
  Record<'section' | 'header' | 'emoji', string>
> = {
  transport: {
    section: 'bg-transport-50 border-transport-200',
    header: 'text-transport-800',
    emoji: 'border-transport-200',
  },
  food: {
    section: 'bg-alimentation-50 border-alimentation-200',
    header: 'text-alimentation-800',
    emoji: 'border-alimentation-200',
  },
  housing: {
    section: 'bg-logement-50 border-logement-200',
    header: 'text-logement-800',
    emoji: 'border-logement-200',
  },
  misc: {
    section: 'bg-divers-50 border-divers-200',
    header: 'text-divers-800',
    emoji: 'border-divers-200',
  },
  societal_services: {
    section: 'bg-servicessocietaux-50 border-servicessocietaux-200',
    header: 'text-servicessocietaux-800',
    emoji: 'border-servicessocietaux-200',
  },
}

export default function ThemeSection({
  theme,
  actions,
  locale,
}: {
  theme: Theme
  actions: Action[]
  locale: Locale
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
          <div className={classes.header}>
            <h2 className="mb-0 text-lg/normal font-bold">{theme.title}</h2>
            <p className="text-sm/normal font-normal">
              <Trans
                locale={locale}
                i18nKey="actions.components.themeSection.description"
                values={{ count: actions.length }}>
                {actions.length} actions recommandées
              </Trans>
            </p>
          </div>
        </div>
      </div>
      <ActionsCarousel locale={locale} className="-mx-2.5 md:mx-0">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </ActionsCarousel>
    </section>
  )
}
