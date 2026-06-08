import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import EventDynamicCounter from './eventHero/EventDynamicCounter'

interface Props {
  locale: Locale
}

export default function EventHero({ locale }: Props) {
  return (
    <div className="w-full">
      <div className="mx-auto flex w-5xl max-w-full flex-col gap-6 md:flex-row md:gap-8">
        <div>
          <Title className="mb-6 text-6xl font-bold">
            <Trans locale={locale} i18nKey="event.hero.title.part1">
              L'impact est plus fort
            </Trans>
            <span className="text-primary-600">
              <Trans locale={locale} i18nKey="event.hero.title.part2">
                quand il est collectif
              </Trans>
            </span>
          </Title>
          <div>
            <Trans locale={locale} i18nKey="event.hero.title.description">
              A l'occasion de la Semaine européenne du développement durable,
              relevez le défi avec votre organisation :{' '}
              <strong>
                mesurez votre empreinte carbone et passez à l'action pour la
                réduire collectivement
              </strong>
            </Trans>
          </div>
        </div>

        <EventDynamicCounter locale={locale} />
      </div>
    </div>
  )
}
