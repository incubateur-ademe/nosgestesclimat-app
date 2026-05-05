import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'
import ImpactCO2Script from '../_components/transitionInfoCard/ImpactCO2Script'

const ALIMENTATION_IMAGE_URL =
  'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/alimentation_graphique_f4391342ee.png'

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/alimentation'>) {
  const { locale } = await params

  return (
    <>
      <TransitionHeaderSection
        locale={locale as Locale}
        category="alimentation"
        remainingSteps={2}
      />

      <TransitionButtons nextCategory="transport" />

      <TransitionInfoCard
        className="bg-alimentation-100"
        title={
          <Trans
            locale={locale}
            i18nKey="simulator.transition.alimentation.info.title">
            <strong>À retenir</strong> sur l'alimentation
          </Trans>
        }
        locale={locale}
        funFactContent={
          <>
            <p className="mb-0 w-40 max-w-full text-center">
              <Trans locale={locale}>Certains repas</Trans>
            </p>

            <div>
              <TiltedBadge color="red">
                <Trans locale={locale}>pèsent plus</Trans>
              </TiltedBadge>
              <span className="ml-2">que d'autres :</span>
            </div>

            <p className="text-primary-600">
              <strong>
                <Trans locale={locale}>attention à ton assiette !</Trans>
              </strong>
            </p>
          </>
        }
        rightContent={
          <ImpactCO2Script
            additionalSearchParams="alimentationEquivalents=cheeseburger,kebab,burgerpoulet,pizza,sushis,burgervegetarien,frites,tofu"
            locale={locale}
            type="alimentation"
          />
        }
      />
    </>
  )
}
