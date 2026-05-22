import ImpactCO2Iframe from '@/components/iframe/ImpactCO2Iframe'
import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/alimentation'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t(
      'simulator.intercalaire.alimentation.meta.title',
      'Section alimentation terminée - Nos Gestes Climat'
    ),
    description: t(
      'simulator.intercalaire.alimentation.meta.description',
      'Bravo, tu as terminé la section alimentation. Découvre l’impact carbone de différents repas.'
    ),
    robots: noIndexObject,
  })
}

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/alimentation'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return (
    <>
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
              <Trans
                locale={locale}
                i18nKey="simulator.transition.alimentation.funFact.line1">
                Certains repas
              </Trans>
            </p>

            <div>
              <TiltedBadge color="red">
                <Trans
                  locale={locale}
                  i18nKey="simulator.transition.alimentation.funFact.line2">
                  pèsent plus
                </Trans>
              </TiltedBadge>
              <Trans
                locale={locale}
                i18nKey="simulator.transition.alimentation.funFact.line2Suffix">
                <span className="ml-2">que d'autres :</span>
              </Trans>
            </div>

            <p className="text-primary-600">
              <strong>
                <Trans
                  locale={locale}
                  i18nKey="simulator.transition.alimentation.funFact.line3">
                  attention à ton assiette !
                </Trans>
              </strong>
            </p>
          </>
        }
        rightContent={
          <ImpactCO2Iframe
            title={t(
              'simulator.intercalaire.alimentation.iframe.title',
              "Comparateur d'impact CO₂ de l'alimentation"
            )}
            additionalSearchParams="alimentationEquivalents=cheeseburger,kebab,burgerpoulet,pizza,sushis,burgervegetarien,frites,tofu"
            locale={locale}
            type="alimentation"
          />
        }
      />
    </>
  )
}
