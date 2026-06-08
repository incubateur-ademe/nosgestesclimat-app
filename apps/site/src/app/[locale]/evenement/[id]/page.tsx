import HeaderServer from '@/components/layout/HeaderServer'
import Main from '@/design-system/layout/Main'
import type { Locale } from '@/i18nConfig'
import EventDetail from './_components/EventDetail'
import EventHero from './_components/EventHero'
import EventStatistics from './_components/EventStatistics'

export default async function EvenementPage({
  params,
}: PageProps<'/[locale]/evenement/[id]'>) {
  const { locale: localeParam } = await params

  const locale = localeParam as Locale

  return (
    <>
      <HeaderServer locale={locale} />

      <Main>
        <EventDetail locale={locale} />
        <EventHero locale={locale} />
        <EventStatistics locale={locale} />
        {/*<EventPodium />
        <EventFunFacts />
        <EventTestimonies />
        <EventTutorial />
        <EventCTASection />*/}
      </Main>
    </>
  )
}
