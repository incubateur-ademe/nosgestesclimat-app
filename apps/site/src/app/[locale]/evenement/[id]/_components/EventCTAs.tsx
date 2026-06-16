import StaggeredCards from '@/components/animations/StaggeredCards'
import Image from 'next/image'
import type { CtaCard } from '../_helpers/eventPageData'
import ActionCard from './eventCTAs/ActionCard'

interface Props {
  imageSrc: string
  heading: string
  description: string
  cards: CtaCard[]
}

export default function EventCTAs({
  imageSrc,
  heading,
  description,
  cards,
}: Props) {
  return (
    <section className="my-16">
      <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-16">
        <div className="w-96 max-w-full">
          <Image
            src={imageSrc}
            alt=""
            aria-hidden
            width="400"
            height="400"
            className="h-auto w-full"
          />
        </div>

        <div className="flex-1 text-left">
          <h2 className="mb-0 text-3xl leading-11 font-bold md:text-5xl md:leading-16">
            {heading}
          </h2>
          <p className="mt-3 text-base text-gray-600">{description}</p>

          <StaggeredCards>
            {cards.map((card, index) => (
              <ActionCard index={index} key={card.alt} {...card} />
            ))}
          </StaggeredCards>
        </div>
      </div>
    </section>
  )
}
