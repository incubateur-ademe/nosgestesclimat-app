import Footer from '@/components/layout/Footer'
import HeaderServer from '@/components/layout/HeaderServer'
import Main from '@/design-system/layout/Main'
import type { Locale } from '@/i18nConfig'
import EventCTAs from './_components/EventCTAs'
import EventDetail from './_components/EventDetail'
import EventHero from './_components/EventHero'
import { getEventPageData } from './_components/eventPageData'
import EventPodium from './_components/EventPodium'
import EventStatistics from './_components/EventStatistics'
import EventTestimonies from './_components/EventTestimonies'
import EventTutorial from './_components/EventTutorial'

export default async function EvenementPage({
  params,
  searchParams,
}: PageProps<'/[locale]/evenement/[id]'>) {
  const { locale: localeParam } = await params

  const locale = localeParam as Locale

  const {
    detailImageSrc,
    dynamicCounter,
    statisticsValues,
    podiumItems,
    testimonies,
    tutorialStepsByMode,
    ctaImageSrc,
    ctaHeading,
    ctaDescription,
    ctaCards,
  } = getEventPageData()

  return (
    <>
      <HeaderServer locale={locale} />

      <Main>
        <div className="mx-auto w-5xl max-w-full px-4 md:p-0">
          <EventDetail locale={locale} imageSrc={detailImageSrc} />
          <EventHero
            locale={locale}
            currentValue={dynamicCounter.currentValue}
            targetValue={dynamicCounter.targetValue}
            progressPercentage={dynamicCounter.progressPercentage}
            primaryCtaHref={dynamicCounter.primaryCtaHref}
            secondaryCtaHref={dynamicCounter.secondaryCtaHref}
          />
        </div>
        <EventStatistics locale={locale} values={statisticsValues} />
        <div className="mx-auto w-5xl max-w-full px-4 md:p-0">
          <EventPodium
            locale={locale}
            searchParams={searchParams}
            items={podiumItems}
          />
          <EventTestimonies locale={locale} testimonies={testimonies} />
        </div>
        <div className="bg-primary-100">
          <div className="mx-auto w-5xl max-w-full px-4 md:p-0">
            <EventTutorial stepsByMode={tutorialStepsByMode} />
          </div>
        </div>
        <div className="mx-auto w-5xl max-w-full px-4 md:p-0">
          <EventCTAs
            imageSrc={ctaImageSrc}
            heading={ctaHeading}
            description={ctaDescription}
            cards={ctaCards}
          />
        </div>
      </Main>

      <Footer locale={locale} />
    </>
  )
}
