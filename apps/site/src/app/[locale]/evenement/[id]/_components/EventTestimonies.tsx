import Trans from '@/components/translation/trans/TransServer'
import Carousel from '@/design-system/carousel/Carousel'
import Title from '@/design-system/layout/Title'
import ScrollReveal from '@/design-system/scroll-reveal/ScrollReveal'
import type { Locale } from '@/i18nConfig'
import type { Testimony } from '../_helpers/eventPageData'
import TestimonyCard from './eventTestimonies/TestimonyCard'

interface Props {
  locale: Locale
  testimonies: Testimony[]
}

export default function EventTestimonies({ locale, testimonies }: Props) {
  return (
    <section className="my-16 flex flex-col">
      <Title
        hasSeparator={false}
        className="text-secondary-700 text-center text-sm! leading-5 font-bold tracking-wide uppercase">
        <Trans i18nKey="event.testimonies.title" locale={locale}>
          Témoignages
        </Trans>
      </Title>

      <p className="text-center text-3xl leading-14 font-bold md:text-5xl md:leading-12">
        <Trans i18nKey="event.testimonies.subtitle" locale={locale}>
          Ils ont franchi le pas
        </Trans>
      </p>

      <ScrollReveal className="px-0 md:px-10">
        <Carousel
          locale={locale}
          className="-mx-4 md:-mx-3"
          innerClassName="py-4 px-4 lg:px-3"
          slideClassName="w-full max-w-none sm:w-full md:w-1/2"
          showMobileNav
          slidesPerGroupDesktop={2}>
          {testimonies.map((testimony, index) => (
            <TestimonyCard key={index} testimony={testimony} />
          ))}
        </Carousel>
      </ScrollReveal>
    </section>
  )
}
