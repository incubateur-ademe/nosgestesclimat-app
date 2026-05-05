import Trans from '@/components/translation/trans/TransServer'
import Emoji from '@/design-system/utils/Emoji'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import ImpactCO2Script from '../_components/transitionInfoCard/ImpactCO2Script'

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/transport'>) {
  const { locale } = await params

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
            <p className="mb-0 text-center">
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
        rightContent={<ImpactCO2Script locale={locale} type="transport" />}
      />
    </>
  )
}
