import HeaderServer from '@/components/layout/HeaderServer'
import Main from '@/design-system/layout/Main'

export default async function EvenementPage({
  params,
}: PageProps<'/[locale]/evenement/[id]'>) {
  const { locale } = await params

  return (
    <>
      <HeaderServer locale={locale} />

      <Main>
        <EventDetail />
        <EventHero />
        <EventStatistics />
        <EventPodium />
        <EventFunFacts />
        <EventTestimonies />
        <EventTutorial />
        <EventCTASection />
      </Main>
    </>
  )
}
