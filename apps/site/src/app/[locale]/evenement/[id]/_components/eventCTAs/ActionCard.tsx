import ButtonLink from '@/design-system/buttons/ButtonLink'
import Emoji from '@/design-system/utils/Emoji'
import { twMerge } from 'tailwind-merge'
import type { CtaCard } from '../eventPageData'

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
