import Footer from '@/components/layout/Footer'
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
        <div className="mx-auto w-5xl max-w-full px-4 md:p-0">
          <EventDetail locale={locale} />
          <EventHero locale={locale} />
        </div>
        <EventStatistics locale={locale} />
        {/*<EventPodium />
        <EventFunFacts />
        <EventTestimonies />
        <EventTutorial />
        <EventCTASection />*/}
      </Main>

      <Footer locale={locale} />
    </>
  )
}
