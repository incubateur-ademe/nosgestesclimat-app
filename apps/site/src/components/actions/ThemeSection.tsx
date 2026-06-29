import Carousel from '@/design-system/carousel/Carousel'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import { useId } from 'react'
import { twMerge } from 'tailwind-merge'
import CarIcon from '../icons/CarIcon'
import FoodIcon from '../icons/FoodIcon'
import HousingIcon from '../icons/HousingIcon'
import MiscIcon from '../icons/MiscIcon'
import PublicServicesIcon from '../icons/PublicServicesIcon'
import Trans from '../translation/trans/TransServer'
import ActionCard from './ActionCard/ActionCard'

const classesByTheme: Record<
  Theme['key'],
  Record<'section' | 'header' | 'icon', string>
> = {
  transport: {
    section: 'bg-transport-50 border-transport-200',
    header: 'text-transport-800',
    icon: 'bg-transport-200 text-transport-800',
  },
  food: {
    section: 'bg-alimentation-50 border-alimentation-200',
    header: 'text-alimentation-800',
    icon: 'bg-alimentation-200 text-alimentation-800',
  },
  housing: {
    section: 'bg-logement-50 border-logement-200',
    header: 'text-logement-800',
    icon: 'bg-logement-200 text-logement-800',
  },
  misc: {
    section: 'bg-divers-50 border-divers-200',
    header: 'text-divers-800',
    icon: 'bg-divers-200 text-divers-800',
  },
  societal_services: {
    section: 'bg-servicessocietaux-50 border-servicessocietaux-200',
    header: 'text-servicessocietaux-800',
    icon: 'bg-servicessocietaux-200 text-servicessocietaux-800',
  },
}

export default function ThemeSection({
  theme,
  actions,
  locale,
  assessmentStatus,
}: {
  theme: Theme
  actions: PersonalizedAction[]
  locale: Locale
  assessmentStatus?: SimulationComputationStatus | null
}) {
  const carouselLabelId = useId()
  const classes = classesByTheme[theme.key]
  const count = actions.length
  return (
    <section
      className={twMerge(
        '-mx-4 border-t-2 border-b-2 px-2 pt-5 pb-4 md:mx-0 md:rounded-2xl md:border-2 md:px-5 md:pt-8 md:pb-7',
        classes.section
      )}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-start gap-1">
          <ThemeIcon themeKey={theme.key} />
          <div className={classes.header}>
            <h2 id={carouselLabelId} className="mb-0 text-lg/normal font-bold">
              {theme.title}
            </h2>
            <p className="text-sm/normal font-normal">
              <Trans
                locale={locale}
                i18nKey="actions.components.themeSection.description"
                values={{ count }}>
                {'{{count}} actions recommandées'}
              </Trans>
            </p>
          </div>
        </div>
      </div>
      <Carousel
        locale={locale}
        aria-labelledby={carouselLabelId}
        className="-mx-2 md:mx-0"
        innerClassName="py-1 px-2 md:px-0">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            locale={locale}
            withThemeBadge={false}
            assessmentStatus={assessmentStatus}
            className="h-full"
          />
        ))}
      </Carousel>
    </section>
  )
}

function ThemeIcon({ themeKey }: { themeKey: Theme['key'] }) {
  const icon = getThemeIcon(themeKey)

  return (
    <span
      aria-hidden="true"
      className={twMerge(
        'size-6 rounded-sm p-1',
        classesByTheme[themeKey].icon
      )}>
      {icon}
    </span>
  )
}

function getThemeIcon(themeKey: Theme['key']) {
  switch (themeKey) {
    case 'transport':
      return <CarIcon />
    case 'food':
      return <FoodIcon />
    case 'housing':
      return <HousingIcon />
    case 'misc':
      return <MiscIcon />
    case 'societal_services':
      return <PublicServicesIcon />
    default:
      themeKey satisfies never
      return ''
  }
}
