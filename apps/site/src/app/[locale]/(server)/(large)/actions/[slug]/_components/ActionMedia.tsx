'use client'

import ImpactCO2Widget from '@/components/ImpactCO2Widget'
import type { Locale } from '@/i18nConfig'
import {
  type ActionMedia as ActionMediaType,
  type ImpactCO2Language,
  ImpactCO2LanguageSchema,
} from '@nosgestesclimat/core/features/actions/types/action-media'
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
  const impactCO2Language = getImpactCO2Language(locale)

  return (
    <figure
      className={className}
      {...props}>
      {(() => {
        switch (media.type) {
          case 'impact_co2':
            return (
              // Compensate widget's inner iframe margins
              <div className="[&_iframe]:-my-4! md:[&_iframe]:-my-8!">
                <ImpactCO2Widget
                  type={media.data.type}
                  language={impactCO2Language}
                  options={media.data.options}
                />
              </div>
            )
          case 'image':
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

function getImpactCO2Language(locale: Locale): ImpactCO2Language {
  const result = ImpactCO2LanguageSchema.safeParse(locale)
  return result.success ? result.data : 'en'
}
