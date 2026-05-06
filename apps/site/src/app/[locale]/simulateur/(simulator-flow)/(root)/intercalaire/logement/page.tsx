import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import Emoji from '@/design-system/utils/Emoji'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getUser } from '@/helpers/server/dal/user'
import { getCurrentSimulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'
import ClientLogementImpactCO2Iframe from './_components/ClientLogementImpactCO2Iframe'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/logement'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t(
      'simulator.intercalaire.logement.meta.title',
      'Section logement terminée - Nos Gestes Climat'
    ),
    description: t(
      'simulator.intercalaire.logement.meta.description',
      'Bravo, tu as terminé la section logement. Découvre l’impact des différents modes de chauffage sur le climat.'
    ),
    robots: noIndexObject,
  })
}

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/logement'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })
  const user = await getUser()
  const simulation = await getCurrentSimulation({ user })

  return (
    <>
      <TransitionHeaderSection
        locale={locale as Locale}
        category="logement"
        remainingSteps={3}
      />

      <TransitionButtons nextCategory="alimentation" />

      <TransitionInfoCard
        className="bg-logement-100"
        title={
          <Trans
            locale={locale}
            i18nKey="simulator.transition.logement.info.title">
            <strong>À retenir</strong> sur le chauffage
          </Trans>
        }
        locale={locale}
        funFactContent={
          <>
            <p className="mb-0 w-40 max-w-full">
              <span>
                <Trans
                  locale={locale}
                  i18nKey="simulator.transition.logement.funFact.line1">
                  Tous les modes de <strong>chauffage</strong>
                </Trans>
              </span>
              <Emoji className="ml-1.5">🔥⚡️</Emoji>
            </p>

            <TiltedBadge color="green">
              <Trans
                locale={locale}
                i18nKey="simulator.transition.logement.funFact.line2">
                n'ont pas
              </Trans>
            </TiltedBadge>

            <p className="text-primary-600">
              <Trans
                locale={locale}
                i18nKey="simulator.transition.logement.funFact.line3">
                <strong>le même impact</strong> sur le climat
              </Trans>
            </p>
          </>
        }
        rightContent={
          <ClientLogementImpactCO2Iframe locale={locale as Locale} />
        }
      />
    </>
  )
}
