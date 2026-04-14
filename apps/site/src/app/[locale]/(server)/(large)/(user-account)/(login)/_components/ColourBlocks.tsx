import DownArrow from '@/components/icons/DownArrow'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  highlights: ReactNode[]
  className?: string
}

export default function ColourBlock({ highlights, className }: Props) {
  return (
    <div
      className={twMerge(
        'mt-6 flex flex-1 flex-col justify-between rounded-2xl bg-blue-100 px-16 py-20',
        className
      )}>
      <ul role="list" className="flex max-w-96 flex-col gap-4">
        {highlights.map((highlight, index) => (
          <li key={index} className="flex items-baseline gap-4">
            <DownArrow className="mb-2 block h-8 w-8 min-w-8 translate-y-2.5 -rotate-90 fill-black" />
            <p className="mb-0">{highlight}</p>
          </li>
        ))}
      </ul>

      <div className="mt-14">
        <img
          className="w-full"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/visuel_login_cbf2f03684.svg"
          alt=""
        />
      </div>
    </div>
  )
}
