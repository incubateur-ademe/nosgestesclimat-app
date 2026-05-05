import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'

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
        locale={locale as Locale}
      />
    </>
  )
}
