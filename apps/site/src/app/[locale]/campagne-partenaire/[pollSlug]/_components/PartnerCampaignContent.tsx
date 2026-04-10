'use client'

import type { PartnerCampaignType } from '@/adapters/cmsClient'
import Trans from '@/components/translation/trans/TransClient'
import Alert from '@/design-system/alerts/alert/Alert'
import Button from '@/design-system/buttons/Button'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Hero from '@/design-system/layout/landingPage/Hero'
import Loader from '@/design-system/layout/Loader'
import Main from '@/design-system/layout/Main'
import { useFetchPublicPoll } from '@/hooks/organisations/polls/useFetchPublicPoll'
import Image from 'next/image'
import type { ReactNode } from 'react'
import PartnerCampaignHeader from './PartnerCampaignHeader'

export default function PartnerCampaignContent({
  pollSlug,
  partnerCampaign,
  partnersComponent,
  faqComponent,
}: {
  pollSlug: string
  partnerCampaign: PartnerCampaignType
  partnersComponent: ReactNode
  faqComponent?: ReactNode
}) {
  const {
    data: pollInfo,
    isError,
    isLoading,
  } = useFetchPublicPoll({
    pollIdOrSlug: pollSlug,
  })

  return (
    <>
      <PartnerCampaignHeader
        logoSrc={partnerCampaign.logo.url}
        alt={partnerCampaign.logo.alternativeText ?? ''}
      />
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
                className="text-left"
                dangerouslySetInnerHTML={{
                  __html: partnerCampaign.htmlContent,
                }}
              />

              {isError && (
                <Alert
                  type="error"
                  description={
                    <Trans>
                      Oups ! Une erreur s'est produite au moment de récupérer
                      les informations de la campagne. Veuillez réessayer
                      ultérieurement.
                    </Trans>
                  }
                />
              )}

              {
                // Loading state
                !isError && isLoading && (
                  <Button className="mt-2 w-40 md:mt-10" size="lg" disabled>
                    <Loader color="light" />
                  </Button>
                )
              }

              {
                // Data fetched successfully state
                !isError && !isLoading && (
                  <ButtonLink
                    size="lg"
                    className="mt-2 md:mt-10"
                    href={`/o/${pollInfo?.organisation?.slug}/${pollSlug}`}>
                    {partnerCampaign?.labelCTA ?? <Trans>Passer le test</Trans>}
                  </ButtonLink>
                )
              }

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
              alt={partnerCampaign.image?.alternativeText ?? ''}
            />
          }
        />

        {faqComponent}

        <div className="mb-10 px-4 md:mb-32 md:px-24 md:py-10">
          {partnersComponent}
        </div>
      </Main>
    </>
  )
}
