import Trans from '@/components/translation/trans/TransServer'
import Emoji from '@/design-system/utils/Emoji'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'
import ImpactCO2Script from '../_components/transitionInfoCard/ImpactCO2Script'

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/logement'>) {
  const { locale } = await params

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
        rightContent={<ImpactCO2Script locale={locale} />}
      />
    </>
  )
}
