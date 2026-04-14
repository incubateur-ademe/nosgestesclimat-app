'use client'

import Image from 'next/image'
import type { JSX } from 'react'
import { twMerge } from 'tailwind-merge'

const getGridColsClassname = (numberItems: number) => {
  switch (numberItems) {
    case 1:
      return 'lg:grid-cols-1'
    case 2:
      return 'lg:grid-cols-2'
    case 3:
      return 'lg:grid-cols-3'
    case 4:
      return 'lg:grid-cols-4'
    case 5:
      return 'lg:grid-cols-5'
    case 6:
      return 'lg:grid-cols-6'
    default:
      return ''
  }
}

export default function WhatDoWeMeasure({
  title,
  listItems,
  description,
  shouldDescriptionBeBeforeList,
  shouldUseDescriptionMaxWidth,
}: {
  title: JSX.Element | string
  listItems?: {
    title: string
    icon: {
      url: string
      alternativeText: string
    }
  }[]
  description: JSX.Element | string
  shouldDescriptionBeBeforeList?: boolean
  shouldUseDescriptionMaxWidth?: boolean
}) {
  return (
    <div className="mb-16 flex max-w-full flex-col gap-10 md:mx-auto md:mb-20 md:max-w-5xl md:px-0">
      <h2 className="mb-0 px-4 text-center text-2xl md:px-0 md:text-3xl">
        {title}
      </h2>

      <section
        className={twMerge(
          'mx-auto w-[800px] max-w-full px-4 text-center text-sm md:px-0 md:text-lg',
          shouldDescriptionBeBeforeList ? '' : 'hidden'
        )}>
        {typeof description === 'string' ? (
          <div
            className="text-center"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          description
        )}
      </section>

      <ul
        className={twMerge(
          `order hidden grid-cols-1 gap-5 md:grid md:grid-cols-2 ${getGridColsClassname(listItems?.length ?? 0)}`,
          shouldUseDescriptionMaxWidth ? 'max-w-[800px]' : ''
        )}
        role="list">
        {listItems?.map(({ icon, title }, index) => (
          <li
            key={`list-item-${title}-${index}`}
            className="border-heroLightBackground bg-primary-50 flex flex-col items-center gap-2 rounded-xl border-2 p-4">
            <div className="flex h-12 w-12 items-center justify-center">
              {icon.url && (
                <Image
                  width={48}
                  height={48}
                  src={icon.url}
                  alt={icon.alternativeText}
                />
              )}
            </div>
            <span className="text-center">{title}</span>
          </li>
        ))}
      </ul>

      <div className="flex overflow-x-auto md:hidden">
        <ul className="flex gap-5 px-[calc(50vw-6.5rem)]">
          {listItems?.map(({ icon, title }, index) => (
            <li
              key={`list-item-${title}-${index}`}
              className="border-heroLightBackground bg-primary-50 flex! h-40! w-52! shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 p-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center">
                  <Image
                    width={48}
                    height={48}
                    src={icon.url}
                    alt={icon.alternativeText}
                  />
                </div>
              </div>
              <p className="mb-0 flex! justify-center text-center text-sm">
                {title}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <section
        className={twMerge(
          'mx-auto w-[800px] max-w-full px-4 text-sm md:px-0 md:text-lg',
          shouldDescriptionBeBeforeList ? 'hidden' : ''
        )}>
        {typeof description === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          description
        )}
      </section>
    </div>
  )
}
