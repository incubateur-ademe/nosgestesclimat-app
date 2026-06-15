import Trans from '@/components/translation/trans/TransServer'
import Carousel from '@/design-system/carousel/Carousel'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

type Testimony = {
  text: string
  author: {
    name: string
    job: string
    avatarSrc: string
  }
}

const MOCK_TESTIMONIES: Testimony[] = [
  {
    text: 'Nous avons proposé à notre communauté de voyageurs d’utiliser Nos Gestes Climat pour calculer leur empreinte écologique. C’était une manière simple et accessible de sensibiliser sans culpabiliser. Résultat : près de 4 700 participations. Un vrai levier pour initier le dialogue sur un tourisme plus responsable.',
    author: {
      name: 'Elisa Papin',
      job: 'Impact Officer chez HomeExchang',
      avatarSrc:
        'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
    },
  },
  {
    text: "La campagne Nos Gestes Climat a réellement permis de faire vivre le sujet sur l'application pass Culture, mais aussi en interne où près d'un tiers des 170 collaborateurs ont participé. Le format a été réellement apprécié par tous et a permis d’initier des discussions importantes.",
    author: {
      name: 'Théo Gasquet',
      job: 'Responsable des relations avec les publics du Pass Culture',
      avatarSrc:
        'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
    },
  },
  {
    text: "La campagne Nos Gestes Climat a réellement permis de faire vivre le sujet sur l'application pass Culture, mais aussi en interne où près d'un tiers des 170 collaborateurs ont participé. Le format a été réellement apprécié par tous et a permis d’initier des discussions importantes.",
    author: {
      name: 'Théo Gasquet',
      job: 'Responsable des relations avec les publics du Pass Culture',
      avatarSrc:
        'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
    },
  },
]

function TestimonyCard({ testimony }: { testimony: Testimony }) {
  return (
    <div className="relative flex h-full flex-col rounded-xl bg-white p-10 shadow-sm">
      <span
        aria-hidden
        className="bg-primary-600 absolute -top-4 left-6 flex h-10 w-10 items-center justify-center rounded-full text-white">
        &rdquo;
      </span>

      <blockquote className="mb-6 flex-1 bg-white p-0 text-sm leading-relaxed text-slate-600 md:text-base">
        {testimony.text}
      </blockquote>

      <div className="flex items-center gap-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
          <Image
            src={testimony.author.avatarSrc}
            alt={testimony.author.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="mb-0 font-bold text-gray-800">
            {testimony.author.name}
          </p>
          <p className="text-sm">{testimony.author.job}</p>
        </div>
      </div>
    </div>
  )
}

interface Props {
  locale: Locale
}

export default async function EventTestimonies({ locale }: Props) {
  const testimonies = MOCK_TESTIMONIES

  return (
    <section className="my-16 flex flex-col">
      <Title
        hasSeparator={false}
        className="text-secondary-700 text-center text-sm! leading-5 font-bold tracking-wide uppercase">
        <Trans i18nKey="event.testimonies.title" locale={locale}>
          Témoignages
        </Trans>
      </Title>

      <p className="text-center text-5xl leading-12 font-bold">
        <Trans i18nKey="event.testimonies.title" locale={locale}>
          Ils ont franchi le pas
        </Trans>
      </p>

      <Carousel
        locale={locale}
        className="-mx-4 md:-mx-3"
        innerClassName="py-4 px-4 md:px-3"
        slideClassName="w-full max-w-none sm:w-full md:w-1/2">
        {testimonies.map((testimony, index) => (
          <TestimonyCard key={index} testimony={testimony} />
        ))}
      </Carousel>
    </section>
  )
}
