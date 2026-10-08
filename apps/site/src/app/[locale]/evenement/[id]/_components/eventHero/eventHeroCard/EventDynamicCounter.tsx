import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import type { EventStatusWithoutNotStarted } from '../../../_types/event'
import { COUNTER_BLOCK_ANIMATION_TOTAL } from './AnimatedCounterBlock'
import ClientCircularProgressBar from './eventDynamicCounter/ClientCircularProgressBar'
import EventLinks from './eventDynamicCounter/EventLinks'
import ObjectiveStatus from './eventDynamicCounter/ObjectiveStatus'
import StatusTitle from './eventDynamicCounter/StatusTitle'

interface Props {
  locale: Locale
  currentValue: number
  targetValue: number
  progressPercentage: number
  primaryCtaHref: string
  secondaryCtaHref: string
  endedCtaHref: string
  status: EventStatusWithoutNotStarted
}

export default function EventDynamicCounter({
  locale,
  currentValue,
  targetValue,
  progressPercentage,
  primaryCtaHref,
  secondaryCtaHref,
  endedCtaHref,
  status,
}: Props) {
  const numberFormatter = new Intl.NumberFormat(locale)

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <StatusTitle locale={locale} status={status} />

      <div className="mb-6 flex gap-4 md:gap-6">
        <div className="max-w-full min-w-16 md:min-w-28 lg:min-w-36">
          <ClientCircularProgressBar
            value={progressPercentage}
            startDelay={COUNTER_BLOCK_ANIMATION_TOTAL}
          />
        </div>

        <div>
          <p className="mb-1! text-slate-600">
            <ObjectiveStatus
              progressPercentage={progressPercentage}
              locale={locale}
              status={status}
            />
          </p>
          <p>
            <span className="mb-1 flex flex-wrap items-baseline gap-1 leading-none! lg:flex-nowrap">
              <span className="text-5xl leading-14! font-bold tracking-tight md:text-6xl md:leading-12!">
                {numberFormatter.format(currentValue)}
              </span>
              <span className="text-2xl leading-none! font-medium tracking-tight text-slate-600 md:text-3xl">
                /{numberFormatter.format(targetValue)}
              </span>
            </span>

            <span className="inline-block text-sm text-slate-600 md:text-base">
              <Trans i18nKey="event.dynamicCounter.target.text" locale={locale}>
                calculs d'empreinte carbone
              </Trans>
            </span>
          </p>
        </div>
      </div>

      <EventLinks
        locale={locale}
        primaryCtaHref={primaryCtaHref}
        secondaryCtaHref={secondaryCtaHref}
        endedCtaHref={endedCtaHref}
        status={status}
      />

      <p className="text-center text-sm text-slate-600">
        <Trans i18nKey="event.dynamicCounter.promise" locale={locale}>
          Résultats en 10 minutes — sans inscription
        </Trans>
      </p>
    </div>
  )
}
