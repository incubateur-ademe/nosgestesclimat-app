import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import Emoji from '@/design-system/utils/Emoji'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import ImpactCO2Iframe from '../_components/transitionInfoCard/ImpactCO2Iframe'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/transport'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t(
      'simulator.intercalaire.transport.meta.title',
      'Section transport terminée - Nos Gestes Climat'
    ),
    description: t(
      'simulator.intercalaire.transport.meta.description',
      'Bravo, tu as terminé la section transport. Découvre l’impact carbone de différents moyens de transport.'
    ),
    robots: noIndexObject,
  })
}

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/transport'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <TransitionHeaderSection
        locale={locale as Locale}
        category="transport"
        remainingSteps={1}
      />

      <TransitionButtons nextCategory="divers" />

      <TransitionInfoCard
        className="bg-transport-100"
        title={
          <Trans
            locale={locale}
            i18nKey="simulator.transition.transport.info.title">
            <strong>À retenir</strong> sur les transports
          </Trans>
        }
        locale={locale}
        arrowText={
          <Trans
            locale={locale}
            i18nKey="simulator.transition.transport.funFact.graphDescription">
            Ce graphique te permet de comparer l'impact de différents moyens de
            transport
          </Trans>
        }
        funFactContent={
          <>
            <p className="mb-0 text-center font-medium">
              <Trans
                locale={locale}
                i18nKey="simulator.transition.transport.funFact.line1">
                Chaque trajet compte :
              </Trans>
            </p>
            <p className="text-primary-600 mb-0 text-2xl font-bold">
              <Trans
                locale={locale}
                i18nKey="simulator.transition.transport.funFact.line2">
                fais le bon choix !
              </Trans>
            </p>
            <Emoji className="text-3xl">🚲 🛴🚶</Emoji>
          </>
        }
        rightContent={
          <ImpactCO2Iframe
            title={t(
              'simulator.intercalaire.transport.iframe.title',
              "Comparateur d'impact CO₂ des transports"
            )}
            locale={locale}
            type="transport"
          />
        }
      />
    </>
  )
}
