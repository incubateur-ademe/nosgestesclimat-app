import Emoji from '@/design-system/utils/Emoji'
import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon'
import { twMerge } from 'tailwind-merge'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActionCard({
  emoji,
  alt,
  title,
  description,
  buttonLabel,
  buttonHref,
  className,
}: (typeof CARDS)[number] & { className?: string }) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-start rounded-2xl bg-white p-6 shadow-sm',
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EventCTAs() {
  return (
    <section className="my-16">
      {/* ---- Desktop: image + title side by side ---- */}
      <div className="mb-10 flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
        {/* Illustration */}
        <div className="shrink-0 md:order-1">
          <img
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_people_raising_arm_fe915601cd.png"
            alt=""
            aria-hidden
            className="h-auto w-48 md:w-56"
          />
        </div>

        {/* Title + subtitle */}
        <div className="text-center md:order-2 md:text-left">
          <h2 className="text-4xl leading-tight font-extrabold text-gray-900 md:text-5xl">
            Prêt·e à rejoindre
            <br />
            l&apos;aventure&nbsp;?
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Deux façons de participer au challenge.
          </p>
        </div>
      </div>

      {/* ---- Cards ---- */}
      <div className="flex flex-col gap-6 md:flex-row">
        {CARDS.map((card) => (
          <ActionCard key={card.alt} {...card} className="md:flex-1" />
        ))}
      </div>
    </section>
  )
}
