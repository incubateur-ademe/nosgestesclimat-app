import Footer from '@/components/layout/Footer'
import HeaderServer from '@/components/layout/HeaderServer'
import { noIndexObject } from '@/constants/metadata'
import Main from '@/design-system/layout/Main'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import EventCTAs from './_components/EventCTAs'
import EventDetail from './_components/EventDetail'
import EventHero from './_components/EventHero'
import EventPodium from './_components/EventPodium'
import EventStatistics from './_components/EventStatistics'
import EventTestimonies from './_components/EventTestimonies'
import EventTutorial from './_components/EventTutorial'
import { getEventPageData } from './_helpers/eventPageData'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/evenement/[id]'>) {
  const { locale: localeParam, id } = await params
  const locale = localeParam as Locale
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t(
      'event.meta.title',
      "Événement collectif d'empreinte carbone - Nos Gestes Climat"
    ),
    description: t(
      'event.meta.description',
      "Relevez le défi avec votre organisation : mesurez votre empreinte carbone et passez à l'action pour la réduire collectivement."
    ),
    alternates: {
      canonical: `/evenement/${id}`,
    },
    robots: noIndexObject,
  })
}

export default async function EvenementPage({
  params,
  searchParams,
}: PageProps<'/[locale]/evenement/[id]'>) {
  const { locale: localeParam } = await params

  const locale = localeParam as Locale

  const { t } = await getServerTranslation({ locale })

  const {
    detailImageSrc,
    startDate,
    dynamicCounter,
    statisticsValues,
    podiumItems,
    testimonies,
    tutorialStepsByMode,
    ctaImageSrc,
    ctaHeading,
    ctaDescription,
    ctaCards,
  } = getEventPageData({ t, locale })

  const hasStarted = new Date() >= new Date(startDate)

  return (
    <>
      <HeaderServer locale={locale} />

      <Main>
        <div className="mx-auto w-5xl max-w-full px-4 lg:p-0">
          <EventDetail locale={locale} imageSrc={detailImageSrc} />

          <EventHero
            locale={locale}
            startDate={startDate}
            currentValue={dynamicCounter.currentValue}
            targetValue={dynamicCounter.targetValue}
            progressPercentage={dynamicCounter.progressPercentage}
            primaryCtaHref={dynamicCounter.primaryCtaHref}
            secondaryCtaHref={dynamicCounter.secondaryCtaHref}
          />
        </div>

        <EventStatistics
          locale={locale}
          values={statisticsValues}
          hasStarted={hasStarted}
        />

        <div className="mx-auto w-5xl max-w-full px-4 lg:p-0">
          <EventPodium
            locale={locale}
            searchParams={searchParams}
            items={podiumItems}
            hasStarted={hasStarted}
          />
        </div>

        <div className="mx-auto w-5xl max-w-full px-4 lg:p-0">
          <EventTestimonies locale={locale} testimonies={testimonies} />
        </div>

        <div className="bg-primary-100">
          <div className="mx-auto w-5xl max-w-full px-4 lg:p-0">
            <EventTutorial stepsByMode={tutorialStepsByMode} />
          </div>
        </div>

        <div className="mx-auto w-5xl max-w-full px-4 lg:p-0">
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
