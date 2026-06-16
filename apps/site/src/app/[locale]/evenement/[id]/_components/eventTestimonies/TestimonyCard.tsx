import Image from 'next/image'
import type { Testimony } from '../../_helpers/eventPageData'

export default function TestimonyCard({ testimony }: { testimony: Testimony }) {
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
