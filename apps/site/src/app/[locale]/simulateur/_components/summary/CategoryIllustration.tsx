'use client'

import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import Image from 'next/image'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

export default function CategoryIllustration({
  category,
  shouldHideIllustration,
}: {
  category: DottedName
  shouldHideIllustration?: boolean
}) {
  const categoryProps = useMemo(() => {
    switch (category) {
      case 'transport':
        return {
          src: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_mother_and_son_on_bike_5883583982.png',
          alt: '',
          className: '',
        }
      case 'alimentation':
        return {
          src: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_girl_cooking_fa71604f8d.png',
          alt: '',
          className: '',
        }
      case 'logement':
        return {
          src: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_girl_reading_newspaper_d171290d3d.png',
          alt: '',
          className: 'min-w-[200px]',
        }
      case 'divers':
        return {
          src: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_at_the_cinema_00898dd691.png',
          alt: '',
          className: '',
        }
      case 'services sociétaux':
        return {
          src: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_children_holding_hand_6951392e78.png',
          alt: '',
          className: '',
        }
      default:
        return null
    }
  }, [category])

  if (!categoryProps || shouldHideIllustration) {
    return null
  }

  return (
    <Image
      src={categoryProps.src}
      alt={categoryProps.alt}
      width={300}
      height={500}
      className={twMerge(
        'bottom-0 ml-auto block w-[160px] md:static md:top-auto md:left-auto md:mx-auto md:w-[240px] md:opacity-100',
        categoryProps.className ?? ''
      )}
    />
  )
}
