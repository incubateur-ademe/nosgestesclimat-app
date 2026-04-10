import Image from 'next/image'
import type { JSX } from 'react'

export default function WhatItIs({
  title,
  description,
  illustration,
}: {
  title: JSX.Element | string
  description: JSX.Element | string
  illustration: {
    url: string
    alternativeText: string
    className?: string
  }
}) {
  return (
    <div className="mx-auto mt-16 mb-20 flex max-w-5xl flex-col gap-10 px-4 md:my-20 md:px-0">
      <h2 className="mb-0 text-center text-2xl md:text-3xl">{title}</h2>

      <div className="flex flex-col items-center gap-16 text-sm md:flex-row md:text-lg">
        {typeof description === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          description
        )}

        <Image
          width={450}
          height={450}
          src={illustration.url}
          alt={illustration.alternativeText}
          className={illustration.className || 'py-6 md:py-10'}
        />
      </div>
    </div>
  )
}
