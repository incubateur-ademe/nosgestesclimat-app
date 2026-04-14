'use client'

import { useLocale } from '@/hooks/useLocale'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

const getLocalisedSrc = (locale: Locale) => {
  switch (locale) {
    case 'en':
      return 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/graphiques_empreinte_carbone_eau_en_73dff81136.png'
    case 'fr':
    default:
      return 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/graphiques_empreinte_carbone_eau_fr_7df50f7102.png'
  }
}

export default function LocalizedTwoGraphsIllustration() {
  const locale = useLocale()

  return (
    <Image
      src={getLocalisedSrc(locale)}
      className="hidden md:block"
      alt=""
      width={600}
      height={800}
    />
  )
}
