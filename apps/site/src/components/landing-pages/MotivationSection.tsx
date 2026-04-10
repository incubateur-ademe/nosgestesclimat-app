import Separator from '@/design-system/layout/Separator'
import Image from 'next/image'
import type { JSX } from 'react'

export default function MotivationSection({
  title,
  description,
  motivationItems,
}: {
  title: JSX.Element | string
  description: JSX.Element | string
  motivationItems?: {
    title: string
    icon: {
      url: string
      alternativeText: string
    }
    description: string
  }[]
}) {
  return (
    <section
      className="w-full pt-16 pb-10 md:py-20"
      data-testid="motivation-section">
      <div className="mx-auto flex max-w-full flex-col gap-4 px-4 md:max-w-5xl md:px-0">
        <h2
          className="mb-0! text-center text-2xl md:text-3xl"
          data-testid="motivation-title">
          {title}
        </h2>

        <Separator
          className="mx-auto my-0"
          data-testid="motivation-separator"
        />

        {typeof description === 'string' ? (
          <div
            className="text-center text-sm md:mx-auto md:max-w-[850px] md:text-lg"
            data-testid="motivation-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <div
            className="text-center text-sm md:mx-auto md:max-w-[850px] md:text-lg"
            data-testid="motivation-description">
            {description}
          </div>
        )}
        {motivationItems && motivationItems.length > 0 && (
          <ul
            className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
            data-testid="motivation-list"
            role="list">
            {motivationItems.map((item, index) => (
              <li
                key={`motivation-item-${index}`}
                className="flex flex-col gap-2 text-center"
                data-testid={`motivation-item-${index}`}>
                <div className="flex justify-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center"
                    data-testid={`motivation-icon-${index}`}>
                    <Image
                      width={32}
                      height={32}
                      src={item.icon.url}
                      alt={item.icon.alternativeText}
                    />
                  </div>
                </div>
                <h3
                  className="mb-0 text-sm font-bold md:text-lg"
                  data-testid={`motivation-item-title-${index}`}>
                  {item.title}
                </h3>
                <div
                  className="text-[13px] md:text-base"
                  data-testid={`motivation-item-description-${index}`}>
                  {item.description}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
