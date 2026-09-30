import Carousel from '@/design-system/carousel/Carousel'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { ActionEventSource } from '@/utils/analytics/trackUniqueEvent'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'cn'
import { useId } from 'react'
import Trans from '../translation/trans/TransServer'
import ActionCardSwitchServer from './actionCard/ActionCardSwitchServer'
import { classesByTheme } from './theme/constants/classesByTheme'
import ThemeIcon from './ThemeIcon'

interface Props {
  theme: Pick<Theme, 'key' | 'title'>
  actions: MaybePersonalizedAction[]
  locale: Locale
  assessmentStatus?: AssessmentStatus | null
  from?: 'fin' | 'mon-espace' | 'index'
  trackingSource?: ActionEventSource
  /** Defaults to the theme title */
  title?: React.ReactNode
  /** Defaults to the number of actions in the section */
  description?: React.ReactNode
  className?: string
}

export default function ThemeSection({
  theme,
  actions,
  locale,
  trackingSource,
  title,
  description,
  className,
  from,
}: Props) {
  const carouselLabelId = useId()
  const classes = classesByTheme[theme.key]
  const count = actions.length
  return (
    <section
      className={twMerge(
        '-mx-4 min-w-0 border-t-2 border-b-2 px-2 pt-5 pb-4 md:mx-0 md:rounded-2xl md:border-2 md:px-5 md:pt-8 md:pb-7',
        classes.section,
        className
      )}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-start gap-1">
          <ThemeIcon themeKey={theme.key} />
          <div className={classes.header}>
            <h2 id={carouselLabelId} className="mb-0 text-lg/normal font-bold">
              {title ?? theme.title}
            </h2>
            <p className="text-sm/normal font-normal">
              {description ?? (
                <Trans
                  locale={locale}
                  i18nKey="actions.components.themeSection.description"
                  values={{ count }}>
                  {'{{count}} actions recommandées'}
                </Trans>
              )}
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
          <ActionCardSwitchServer
            key={action.id}
            action={action}
            withThemeBadge={false}
            className="h-full"
            source={trackingSource}
            locale={locale}
            from={from}
          />
        ))}
      </Carousel>
    </section>
  )
}
