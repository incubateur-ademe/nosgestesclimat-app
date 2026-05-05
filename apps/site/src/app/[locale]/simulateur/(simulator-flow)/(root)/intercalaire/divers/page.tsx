import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'
import ImpactCO2Script from '../_components/transitionInfoCard/ImpactCO2Script'

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/divers'>) {
  const { locale } = await params

  return (
    <>
      <TransitionHeaderSection
        locale={locale as Locale}
        category="divers"
        remainingSteps={0}
      />

      <TransitionButtons nextCategory="divers" showResults />

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
            <p className="text-primary-600 mb-0 text-center text-2xl font-bold">
              <Trans locale={locale}>85% de l'impact</Trans>
            </p>
            <p className="mb-0 text-center">
              <Trans locale={locale}>d'un appareil numérique</Trans>
            </p>
            <p className="mb-0 text-center">
              <strong className="text-yellow-700">
                <Trans locale={locale}>provient de sa</Trans>
              </strong>{' '}
              <TiltedBadge color="yellow">
                <Trans locale={locale}>fabrication</Trans>
              </TiltedBadge>
            </p>
          </>
        }
        rightContent={
          <ImpactCO2Script key="divers" locale={locale} type="numerique" />
        }
      />
    </>
  )
}
