import Emoji from '@/design-system/utils/Emoji'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import type { CtaCard } from '../../_helpers/eventPageData'

interface Props extends CtaCard {
  className?: string
  index?: number
}

export default function ActionCard({
  emoji,
  title,
  description,
  buttonLabel,
  buttonHref,
  className,
  index,
}: Props) {
  return (
    <div className="group relative">
      {/* Rainbow animated shadow */}
      <div
        aria-hidden="true"
        className="bg-rainbow animate-rainbow-shadow-move absolute -inset-2 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
      />

      {/* Card content */}
      <div
        className={twMerge(
          'relative flex flex-1 flex-col items-start rounded-3xl bg-white px-4 py-6 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]',
          index === 0 ? 'bg-primary-100' : 'border-primary-600 border bg-white',
          className
        )}>
        {/* Full-card overlay link */}
        <Link
          href={buttonHref}
          className="focus-visible:ring-primary-700 absolute inset-0 z-10 rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-3 focus-visible:outline-hidden"
          aria-label={title}
        />

        <div className="bg-primary-50 pointer-events-none mb-4 flex size-12 items-center justify-center rounded-full">
          <Emoji className="text-2xl">{emoji}</Emoji>
        </div>

        <h3 className="pointer-events-none mb-2 text-lg font-bold text-gray-900">
          {title}
        </h3>

        <p className="pointer-events-none mb-6 flex-1 text-sm leading-relaxed">
          {description}
        </p>

        {/* Visual button (non-interactive, pointer-events passthrough) */}
        <span className="border-primary-700 text-primary-700 pointer-events-none flex w-full items-center justify-center rounded-full border-2 bg-white px-4 py-2 text-sm font-bold whitespace-normal no-underline">
          {buttonLabel}
          <span aria-hidden="true" className="ml-1.5">
            →
          </span>
        </span>
      </div>
    </div>
  )
}
