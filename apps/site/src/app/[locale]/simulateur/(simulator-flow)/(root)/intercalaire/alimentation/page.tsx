import ImpactCO2Iframe from '@/components/iframe/ImpactCO2Iframe'
import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import TransitionInfoCard from '../_components/TransitionInfoCard'
import TiltedBadge from '../_components/transitionInfoCard/funFactCard/TiltedBadge'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/alimentation'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale: locale as Locale,
    title: t(
      'simulator.intercalaire.alimentation.meta.title',
      'Section alimentation terminée - Nos Gestes Climat'
    ),
    description: t(
      'simulator.intercalaire.alimentation.meta.description',
      'Bravo, tu as terminé la section alimentation. Découvre l’impact carbone de différents repas.'
    ),
    alternates: {
      canonical: '/simulateur/intercalaire/alimentation',
    },
    robots: noIndexObject,
  })
}

export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/alimentation'>) {
  const { locale } = (await params) as { locale: Locale }
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
            <p className="text-primary-600 mb-0 w-40 max-w-full text-center font-bold">
              <Trans
                locale={locale}
                i18nKey="simulator.transition.alimentation.funFact.line1">
                Tous les repas
              </Trans>
            </p>

            <div>
              <TiltedBadge color="red">
                <Trans
                  locale={locale}
                  i18nKey="simulator.transition.alimentation.funFact.line2">
                  n'ont pas
                </Trans>
              </TiltedBadge>
              <Trans
                locale={locale}
                i18nKey="simulator.transition.alimentation.funFact.line2Suffix">
                <span className="ml-2">le même impact&nbsp;!</span>
              </Trans>
            </div>
          </>
        }
        rightContent={
          <ImpactCO2Iframe
            title={t(
              'simulator.intercalaire.alimentation.iframe.title',
              "Comparateur d'impact CO₂ de l'alimentation"
            )}
            options={{
              alimentationEquivalents:
                'cheeseburger,kebab,burgerpoulet,pizza,sushis,burgervegetarien,frites,tofu',
            }}
            locale={locale}
            type="alimentation"
            className="min-h-330"
          />
        }
        arrowText={
          <Trans
            locale={locale}
            i18nKey="simulator.transition.alimentation.graph.arrowText">
            Ce graphique te permet de mieux comprendre l’impact carbone de tout
            ce que tu manges
          </Trans>
        }
      />
    </>
  )
}
