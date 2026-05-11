import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'
import ImpactCO2Iframe from '../_components/transitionInfoCard/ImpactCO2Iframe'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/divers'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t(
      'simulator.intercalaire.divers.meta.title',
      'Section divers terminée - Nos Gestes Climat'
    ),
    description: t(
      'simulator.intercalaire.divers.meta.description',
      'Bravo, tu as terminé la section divers. Découvre l’impact du numérique et de la consommation.'
    ),
    robots: noIndexObject,
  })
}

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/divers'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <TransitionHeaderSection
        locale={locale as Locale}
        category="divers"
        remainingSteps={0}
      />

      <TransitionButtons category="divers" showResults />

      <TransitionInfoCard
        className="bg-divers-100"
        title={
          <Trans
            locale={locale}
            i18nKey="simulator.transition.divers.info.title">
            <strong>À retenir</strong> sur le numérique
          </Trans>
        }
        locale={locale}
        funFactContent={
          <>
            <p className="text-primary-600 mb-0 text-center text-2xl font-bold font-medium">
              <Trans
                locale={locale}
                i18nKey="simulator.transition.divers.funFact.line1">
                85% de l'impact
              </Trans>
            </p>
            <p className="mb-0 text-center">
              <Trans
                locale={locale}
                i18nKey="simulator.transition.divers.funFact.line2">
                d'un appareil numérique
              </Trans>
            </p>
            <p className="mb-0 text-center">
              <strong className="text-yellow-700">
                <Trans
                  locale={locale}
                  i18nKey="simulator.transition.divers.funFact.line3">
                  provient de sa
                </Trans>
              </strong>{' '}
              <TiltedBadge color="yellow">
                <Trans
                  locale={locale}
                  i18nKey="simulator.transition.divers.funFact.line4">
                  fabrication
                </Trans>
              </TiltedBadge>
            </p>
          </>
        }
        rightContent={
          <ImpactCO2Iframe
            title={t(
              'simulator.intercalaire.divers.iframe.title',
              "Comparateur d'impact CO₂ du numérique"
            )}
            locale={locale}
            type="numerique"
          />
        }
      />
    </>
  )
}
