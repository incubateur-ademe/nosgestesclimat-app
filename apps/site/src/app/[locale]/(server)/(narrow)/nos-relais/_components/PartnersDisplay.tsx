'use client'

import type { PartnerType } from '@/adapters/cmsClient'
import { FILTER_SEARCH_PARAM_KEY } from '@/constants/filtering'
import Card from '@/design-system/layout/Card'
import { encodeDottedNameAsURI } from '@/utils/format/encodeDottedNameAsURI'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

interface Props {
  partnersByCategories: Record<string, PartnerType[]>
  categoryFilter?: string
}

export default function PartnersDisplay({
  partnersByCategories,
  categoryFilter,
}: Props) {
  const currentCategoryFilter =
    useSearchParams().get(FILTER_SEARCH_PARAM_KEY) || categoryFilter

  // If no category is selected, display all categories
  // Otherwise, display only the selected category
  const categoriesToShow = currentCategoryFilter
    ? Object.keys(partnersByCategories).filter(
        (category) => currentCategoryFilter === encodeDottedNameAsURI(category)
      )
    : Object.keys(partnersByCategories)

  return (
    <>
      {categoriesToShow.map((category: string) => (
        <div key={category} className="mb-16">
          <h2>{category}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {partnersByCategories[category].map((partner) => (
              <Card
                key={partner.name}
                href={partner.link}
                tag="a"
                className="bg-primary-50 flex flex-col justify-between border-none no-underline"
                target="_blank">
                <Image
                  src={partner.imageSrc.trim()}
                  width="100"
                  height="100"
                  className="mx-auto mb-4 h-36 w-2/3 object-contain"
                  alt={partner.name}
                />
                <section>
                  <p className="mb-1 font-bold">{partner.name}</p>
                  <p className="my-0 text-sm underline">
                    {' '}
                    {
                      partner.link
                        .replace('https://', '')
                        .replace('www.', '')
                        .split('/')[0]
                    }
                  </p>
                </section>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
