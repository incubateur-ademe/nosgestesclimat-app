import ButtonLink from '@/design-system/buttons/ButtonLink'
import Emoji from '@/design-system/utils/Emoji'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'
import StaggeredCards from './StaggeredCards'

const CARDS = [
  {
    emoji: '👤',
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
}: (typeof CARDS)[number] & { className?: string; index?: number }) {
  return (
    <div
      className={twMerge(
        'flex min-w-0 flex-1 flex-col items-start rounded-2xl bg-white px-4 py-6 shadow-sm',
        index === 0 ? 'bg-primary-100' : 'border-primary-600 border bg-white',
        className
      )}>
      <div className="bg-primary-50 mb-4 flex size-12 items-center justify-center rounded-full">
        <Emoji className="text-2xl">{emoji}</Emoji>
      </div>

      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">
        {description}
      </p>

      <ButtonLink
        href={buttonHref}
        color="secondary"
        size="sm"
        className="w-full whitespace-nowrap">
        {buttonLabel}
        <span aria-hidden="true" className="ml-1.5">
          →
        </span>
      </ButtonLink>
    </div>
  )
}

export default function EventCTAs() {
  return (
    <section className="my-16">
      <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-16">
        <div className="w-96 max-w-full">
          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/people_raising_arms_v2_dd1c17393a.svg"
            alt=""
            aria-hidden
            width="400"
            height="400"
            className="h-auto w-full"
          />
        </div>

        <div className="flex-1 text-left">
          <h2 className="mb-0 text-3xl leading-11 font-bold md:text-5xl md:leading-16">
            Prêt·e à rejoindre
            <br />
            l&apos;aventure&nbsp;?
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Deux façons de participer au challenge.
          </p>

          <StaggeredCards>
            {CARDS.map((card, index) => (
              <ActionCard index={index} key={card.alt} {...card} />
            ))}
          </StaggeredCards>
        </div>
      </div>
    </section>
  )
}
