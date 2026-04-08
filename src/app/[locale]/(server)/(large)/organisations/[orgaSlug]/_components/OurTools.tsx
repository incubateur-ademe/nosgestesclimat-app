'use client'

import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon'
import Trans from '@/components/translation/trans/TransClient'
import {
  organisationsDashboardClickAteliers,
  organisationsDashboardClickImpactCo2,
  organisationsDashboardDownloadKit,
} from '@/constants/tracking/pages/organisationsDashboard'
import { MATOMO_CAMPAIGN_KEY } from '@/constants/urls/utm'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import CTACard from './CTACard'

export default function OurTools() {
  const { t } = useClientTranslation()

  return (
    <section>
      <Title tag="h2" title={<Trans>Nos outils</Trans>} />

      <ul className="col-span-1 mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <li className="flex">
          <CTACard
            className="border-2 border-gray-200 px-8"
            overLabel={<Trans>Communiquez sur la campagne</Trans>}
            title={<Trans>Kit de diffusion</Trans>}
            tag="h3"
            description={
              <Trans>
                Logo, affiches et présentations : retrouvez tous les outils pour
                partager Nos Gestes Climat dans ce kit.
              </Trans>
            }>
            <ButtonLink
              onClick={() => {
                trackMatomoEvent__deprecated(organisationsDashboardDownloadKit)
              }}
              className="mt-auto w-full justify-center align-bottom"
              color="secondary"
              href="https://accelerateur-transition-ecologique-ademe.notion.site/Kit-de-communication-Nos-Gestes-Climat-1156523d57d780fbb2a2dd413aef2681"
              target="_blank"
              aria-label={t(
                'Télécharger le kit, ouvrir dans un nouvel onglet'
              )}>
              <Trans>Accéder au kit</Trans>
              <ExternalLinkIcon
                role="img"
                aria-label={t(
                  'organisations.ourTools.newTab',
                  'Ouvrir dans une nouvelle fenêtre'
                )}
                className="stroke-primary-700 ml-2"
              />
            </ButtonLink>
          </CTACard>
        </li>

        <li className="flex">
          <CTACard
            className="relative overflow-hidden border-2 border-gray-200 px-8"
            overLabel={<Trans>Animez un atelier</Trans>}
            title={<Trans>Les ressources de l'ABC</Trans>}
            tag="h3"
            description={
              <Trans>
                Organisez des temps d’animation et d’échanges physiques autour
                de Nos Gestes Climat pour fédérer et renforcer la compréhension
                des participants.
              </Trans>
            }>
            <ButtonLink
              color="secondary"
              trackingEvent={organisationsDashboardClickAteliers}
              className="mt-auto w-full justify-center"
              href="https://drive.google.com/drive/folders/1dORmBbDLDG31PLLOblP8Wg5CrrksAfjV"
              target="_blank"
              aria-label={t(
                'Découvrez les ateliers de l’ABC, ouvrir dans une nouvelle fenêtre'
              )}>
              <Trans>Accéder aux ressources</Trans>
              <ExternalLinkIcon
                role="img"
                aria-label={t(
                  'organisations.ourTools.newTab',
                  'Ouvrir dans une nouvelle fenêtre'
                )}
                className="stroke-primary-700 ml-2"
              />
            </ButtonLink>
          </CTACard>
        </li>

        <li className="flex">
          <CTACard
            className="border-2 border-gray-200 px-8"
            overLabel={<Trans>Valorisez vos données carbone</Trans>}
            title={<Trans>Impact CO2</Trans>}
            tag="h3"
            description={
              <Trans>
                Vous souhaitez illustrer une quantité de CO₂e et diffuser les
                bons ordres de grandeur à votre communauté ? Le Comparateur
                carbone de l’ADEME est l’outil qu’il vous faut !
              </Trans>
            }>
            <ButtonLink
              className="mt-auto w-full justify-center align-bottom"
              color="secondary"
              href={`https://impactco2.fr/comparateur?${MATOMO_CAMPAIGN_KEY}=ngc-orga`}
              target="_blank"
              trackingEvent={organisationsDashboardClickImpactCo2}
              aria-label={t(
                'Découvrez le calculateur, ouvrir dans une nouvelle fenêtre'
              )}>
              <Trans>Découvrir le calculateur</Trans>
              <ExternalLinkIcon
                role="img"
                aria-label={t(
                  'organisations.ourTools.newTab',
                  'Ouvrir dans une nouvelle fenêtre'
                )}
                className="stroke-primary-700 ml-2"
              />
            </ButtonLink>
          </CTACard>
        </li>
      </ul>
    </section>
  )
}
