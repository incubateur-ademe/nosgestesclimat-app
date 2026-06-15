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
    text: "Grâce à Nos Gestes Climat, j'ai pu prendre conscience de mon impact et mobiliser toute mon équipe autour de la réduction de notre empreinte carbone.",
    author: {
      name: 'Marie Dupont',
      job: 'Responsable RSE',
      avatarSrc:
        'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
    },
  },
  {
    text: "Un outil simple et efficace qui a permis à nos collaborateurs de mieux comprendre les enjeux climatiques et d'agir concrètement.",
    author: {
      name: 'Thomas Martin',
      job: 'Directeur Développement Durable',
      avatarSrc:
        'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
    },
  },
  {
    text: "L'événement a été un vrai succès grâce à cet outil ludique et pédagogique. Nos participants ont adoré comparer leurs résultats !",
    author: {
      name: 'Sophie Bernard',
      job: 'Cheffe de projet Événementiel',
      avatarSrc:
        'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
    },
  },
  {
    text: "En tant qu'association, nous avons pu sensibiliser nos bénévoles de manière interactive. Un vrai plus pour notre mission.",
    author: {
      name: 'Lucas Petit',
      job: "Président d'association",
      avatarSrc:
        'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
    },
  },
]

function TestimonyCard({ testimony }: { testimony: Testimony }) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow-md">
      <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-gray-700 md:text-base">
        &ldquo;{testimony.text}&rdquo;
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
          <p className="text-sm font-bold text-gray-800">
            {testimony.author.name}
          </p>
          <p className="text-xs font-light text-gray-500">
            {testimony.author.job}
          </p>
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
  const useCarousel = testimonies.length > 2

  return (
    <section className="mt-16">
      <Title hasSeparator={false} size="xl" className="mb-10 text-center">
        <Trans i18nKey="event.testimonies.title" locale={locale}>
          Ils témoignent
        </Trans>
      </Title>

      {useCarousel ? (
        <Carousel
          locale={locale}
          className="-mx-4 md:mx-0"
          innerClassName="py-1 px-4 md:px-0">
          {testimonies.map((testimony, index) => (
            <TestimonyCard key={index} testimony={testimony} />
          ))}
        </Carousel>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {testimonies.map((testimony, index) => (
            <TestimonyCard key={index} testimony={testimony} />
          ))}
        </div>
      )}
    </section>
  )
}
