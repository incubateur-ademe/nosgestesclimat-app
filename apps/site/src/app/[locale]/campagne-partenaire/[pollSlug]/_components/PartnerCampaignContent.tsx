'use client'

import type { PartnerCampaignType } from '@/adapters/cmsClient'
import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Hero from '@/design-system/layout/landingPage/Hero'
import Main from '@/design-system/layout/Main'
import Image from 'next/image'
import type { ReactNode } from 'react'

export default function PartnerCampaignContent({
  pollSlug,
  organisationSlug,
  partnerCampaign,
  partnersComponent,
  faqComponent,
}: {
  pollSlug: string
  organisationSlug: string
  partnerCampaign: PartnerCampaignType
  partnersComponent: ReactNode
  faqComponent?: ReactNode
}) {
  return (
    <Main>
      <Hero
        title={
          <span className="block w-full text-left">
            {partnerCampaign.title}
          </span>
        }
        className="pt-8 pb-0 md:pt-16 md:pb-20"
        style={
          partnerCampaign?.backgroundColor
            ? { backgroundColor: partnerCampaign?.backgroundColor }
            : {}
        }
        description={
          <>
            <div
              className="markdown text-left"
              dangerouslySetInnerHTML={{
                __html: partnerCampaign.htmlContent,
              }}
            />

            <ButtonLink
              size="lg"
              className="mt-2 md:mt-10"
              href={`/o/${organisationSlug}/${pollSlug}`}>
              {partnerCampaign?.labelCTA ?? <Trans>Passer le test</Trans>}
            </ButtonLink>

            <Image
              src={
                partnerCampaign.image?.url ??
                'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg'
              }
              width={300}
              height={300}
              className="mx-auto mt-6 block text-center md:hidden"
              alt=""
            />
          </>
        }
        illustration={
          <Image
            src={
              partnerCampaign.image?.url ??
              'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg'
            }
            width={400}
            height={300}
            className="w-96"
            alt=""
          />
        }
      />

      {faqComponent}

      <div className="mb-10 px-4 md:mb-32 md:px-24 md:py-10">
        {partnersComponent}
      </div>
    </Main>
  )
}
