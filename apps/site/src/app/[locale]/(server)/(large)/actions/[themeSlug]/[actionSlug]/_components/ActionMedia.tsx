import ImpactCO2Iframe from '@/components/iframe/ImpactCO2Iframe'
import type { Locale } from '@/i18nConfig'
import { type ActionMedia as ActionMediaType } from '@nosgestesclimat/core/features/actions/types/action-media'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface MediaProps extends React.ComponentPropsWithoutRef<'figure'> {
  media: ActionMediaType
  locale: Locale
}

export function ActionMedia({
  media,
  locale,
  className,
  ...props
}: MediaProps) {
  return (
    <figure className={twMerge('flex flex-col md:gap-2', className)} {...props}>
      {(() => {
        switch (media.type) {
          case 'impact_co2':
            return (
              // Compensate widget's inner iframe margins
              <div className="[&_iframe]:-my-4! md:[&_iframe]:-my-8!">
                <ImpactCO2Iframe
                  type={media.data.type}
                  locale={locale}
                  title={media.title}
                  hideButtons
                  options={media.data.options}
                  className="min-h-144"
                />
              </div>
            )
          case 'image':
            // TODO: improve image handling (size, placeholder, performance, etc.)
            // https://www.notion.so/accelerateur-transition-ecologique-ademe/Support-des-images-dans-le-d-tail-d-une-action-35e6523d57d7800898befc3e63f77395
            return (
              <Image
                src={media.src}
                alt={media.alt}
                width={100}
                height={100}
                className="w-full rounded-lg"
              />
            )
          default:
            media satisfies never
            return null
        }
      })()}
      <figcaption className="text-center text-sm/normal text-slate-600 md:-order-1">
        {media.title}
      </figcaption>
    </figure>
  )
}
