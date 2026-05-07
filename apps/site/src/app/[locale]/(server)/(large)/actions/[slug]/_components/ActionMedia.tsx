'use client'

import ImpactCO2Widget from '@/components/ImpactCO2Widget'
import type { Locale } from '@/i18nConfig'
import {
  type ActionMedia as ActionMediaType,
  type ImpactCO2Language,
  ImpactCO2LanguageSchema,
} from '@nosgestesclimat/core/features/actions/types/action-media'
import Image from 'next/image'

interface MediaProps {
  media: ActionMediaType
  locale: Locale
}

export function ActionMedia({ media, locale }: MediaProps) {
  const impactCO2Language = getImpactCO2Language(locale)

  return (
    <figure>
      {(() => {
        switch (media.type) {
          case 'impact_co2':
            return (
              <ImpactCO2Widget
                type={media.data.type}
                language={impactCO2Language}
              />
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
      <figcaption className="text-sm/normal text-slate-600">
        {media.title}
      </figcaption>
    </figure>
  )
}

function getImpactCO2Language(locale: Locale): ImpactCO2Language {
  const result = ImpactCO2LanguageSchema.safeParse(locale)
  return result.success ? result.data : 'en'
}
