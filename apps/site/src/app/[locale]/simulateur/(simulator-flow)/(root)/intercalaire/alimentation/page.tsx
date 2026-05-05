import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'
import TransitionButtons from '../_components/TransitionButtons'
import TransitionHeaderSection from '../_components/TransitionHeaderSection'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'

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
          <div className="mt-10 h-auto w-full overflow-hidden rounded-2xl border-2 border-[#257674] bg-white">
            <Image
              src={ALIMENTATION_IMAGE_URL}
              width={600}
              height={400}
              alt="Graphique sur l'impact climatique de l'alimentation"
              className="h-auto w-full"
              style={{ clipPath: 'inset(3px)' }}
            />
          </div>
        }
      />
    </>
  )
}
