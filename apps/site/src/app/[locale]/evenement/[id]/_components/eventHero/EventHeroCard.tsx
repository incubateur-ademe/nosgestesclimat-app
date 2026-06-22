import type { Locale } from '@/i18nConfig'
import AnimatedCounterBlock from './AnimatedCounterBlock'
import EventCountdown from './EventCountdown'
import EventDynamicCounter from './EventDynamicCounter'

interface Props {
  locale: Locale
  startDate: string
  currentValue: number
  targetValue: number
  progressPercentage: number
  primaryCtaHref: string
  secondaryCtaHref: string
}

export default function EventHeroCard({
  locale,
  startDate,
  currentValue,
  targetValue,
  progressPercentage,
  primaryCtaHref,
  secondaryCtaHref,
}: Props) {
  const hasEventStarted = new Date() >= new Date(startDate)

  if (hasEventStarted) {
    return (
      <AnimatedCounterBlock>
        <EventDynamicCounter
          locale={locale}
          currentValue={currentValue}
          targetValue={targetValue}
          progressPercentage={progressPercentage}
          primaryCtaHref={primaryCtaHref}
          secondaryCtaHref={secondaryCtaHref}
        />
      </AnimatedCounterBlock>
    )
  }

  return (
    <EventCountdown
      targetDate={startDate}
      primaryCtaHref={primaryCtaHref}
      secondaryCtaHref={secondaryCtaHref}
    />
  )
}
