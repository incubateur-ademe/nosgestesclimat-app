import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon'
import Emoji from '@/design-system/utils/Emoji'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

const CARDS = [
  {
    emoji: '🧑',
    alt: 'Individuel',
    title: 'En individuel',
    description:
      'Estimez votre empreinte carbone personnelle et découvrez des actions concrètes pour la réduire.',
    buttonLabel: 'Je participe',
    buttonHref: '#',
  },
  {
    emoji: '🏛️',
    alt: 'Organisation',
    title: 'En organisation',
    description:
      'Créez un test collectif, partagez-le à vos équipes et visualisez les résultats de votre campagne.',
    buttonLabel: 'Je crée un test collectif',
    buttonHref: '#',
  },
] as const

function ActionCard({
  emoji,
  title,
  description,
  buttonLabel,
  buttonHref,
  className,
  index,
}: (typeof CARDS)[number] & { className?: string; index?: 0 | 1 }) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-start rounded-2xl bg-white p-6 shadow-sm',
        index === 0 ? 'bg-primary-100' : 'border-primary-600 border bg-white',
        className
      )}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#F3E8FF]">
        <Emoji className="text-2xl">{emoji}</Emoji>
      </div>

      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">
        {description}
      </p>

      <a
        href={buttonHref}
        className="border-primary-700 text-primary-700 hover:bg-primary-50 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors">
        {buttonLabel}
        <ExternalLinkIcon className="text-primary-700" />
      </a>
    </div>
  )
}

export default function EventCTAs() {
  return (
    <section className="my-16">
      <div className="mb-10 flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-16">
        <div className="flex-1">
          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/people_raising_arms_v2_dd1c17393a.svg"
            alt=""
            aria-hidden
            width="400"
            height="400"
            className="h-auto w-full"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl leading-tight font-extrabold text-gray-900 md:text-5xl">
            Prêt·e à rejoindre
            <br />
            l&apos;aventure&nbsp;?
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Deux façons de participer au challenge.
          </p>

          <div className="flex flex-col gap-6 md:flex-row">
            {CARDS.map((card, index) => (
              <ActionCard
                index={index}
                key={card.alt}
                {...card}
                className="md:flex-1"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
