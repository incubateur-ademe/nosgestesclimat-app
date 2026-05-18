import ImpactCO2Widget from '@/components/ImpactCO2Widget'
import type { Locale } from '@/i18nConfig'
import { type ActionMedia as ActionMediaType } from '@nosgestesclimat/core/features/actions/types/action-media'
import Image from 'next/image'

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
    <figure className={className} {...props}>
      {(() => {
        switch (media.type) {
          case 'impact_co2':
            return (
              // Compensate widget's inner iframe margins
              <div className="[&_iframe]:-my-4! md:[&_iframe]:-my-8!">
                <ImpactCO2Widget
                  type={media.data.type}
                  language={locale}
                  options={media.data.options}
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
      <figcaption className="text-right text-sm/normal text-slate-600">
        {media.title}
      </figcaption>
    </figure>
  )
}
