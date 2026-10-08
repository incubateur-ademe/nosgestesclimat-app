import type { Locale } from '@/i18nConfig'
import type { EventStatus } from '../../_types/event'
import AnimatedCounterBlock from './eventHeroCard/AnimatedCounterBlock'
import EventCountdown from './eventHeroCard/EventCountdown'
import EventDynamicCounter from './eventHeroCard/EventDynamicCounter'

interface Props {
  locale: Locale
  startDate: Date
  status: EventStatus
  currentValue: number
  targetValue: number
  progressPercentage: number
  primaryCtaHref: string
  secondaryCtaHref: string
  endedCtaHref: string
}

export default function EventHeroCard({
  locale,
  startDate,
  status,
  currentValue,
  targetValue,
  progressPercentage,
  primaryCtaHref,
  secondaryCtaHref,
  endedCtaHref,
}: Props) {
  return (
    <div className="relative flex-1 [&:has(.btn-group:hover)>div:first-child]:opacity-80">
      {/* Rainbow animated shadow — shared across counter and countdown */}
      <div
        aria-hidden="true"
        className="bg-rainbow animate-rainbow-shadow-move absolute -inset-2 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500"
      />

      <div className="transition-transform duration-200 [&:has(.btn-group:hover)]:scale-[1.02]">
        {status == 'notStarted' ? (
          <EventCountdown
            targetDate={startDate}
            primaryCtaHref={primaryCtaHref}
            secondaryCtaHref={secondaryCtaHref}
          />
        ) : (
          <AnimatedCounterBlock>
            <EventDynamicCounter
              locale={locale}
              currentValue={currentValue}
              targetValue={targetValue}
              progressPercentage={progressPercentage}
              primaryCtaHref={primaryCtaHref}
              secondaryCtaHref={secondaryCtaHref}
              endedCtaHref={endedCtaHref}
              status={status}
            />
          </AnimatedCounterBlock>
        )}
      </div>
    </div>
  )
}
