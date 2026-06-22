import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import EventHeroCard from './eventHero/EventHeroCard'

interface Props {
  locale: Locale
  startDate: string
  currentValue: number
  targetValue: number
  progressPercentage: number
  primaryCtaHref: string
  secondaryCtaHref: string
}

export default function EventHero({
  locale,
  startDate,
  currentValue,
  targetValue,
  progressPercentage,
  primaryCtaHref,
  secondaryCtaHref,
}: Props) {
  return (
    <div className="mb-16 flex flex-col gap-6 md:flex-row md:gap-16">
      <div className="flex-1">
        <Title
          hasSeparator={false}
          className="mb-6 text-5xl leading-10 font-bold tracking-tight md:text-6xl! md:leading-16">
          <Trans locale={locale} i18nKey="event.hero.title.part1">
            L'impact est plus fort
          </Trans>
          <br />
          <span className="text-primary-600 leading-10! md:leading-16!">
            <Trans locale={locale} i18nKey="event.hero.title.part2">
              quand il est collectif
            </Trans>
          </span>
        </Title>
        <p>
          <Trans locale={locale} i18nKey="event.hero.title.description">
            A l'occasion de la Semaine européenne du développement durable,
            relevez le défi avec votre organisation :{' '}
            <strong>
              mesurez votre empreinte carbone et passez à l'action pour la
              réduire collectivement
            </strong>
          </Trans>
        </p>
      </div>

      <EventHeroCard
        locale={locale}
        startDate={startDate}
        currentValue={currentValue}
        targetValue={targetValue}
        progressPercentage={progressPercentage}
        primaryCtaHref={primaryCtaHref}
        secondaryCtaHref={secondaryCtaHref}
      />
    </div>
  )
}
