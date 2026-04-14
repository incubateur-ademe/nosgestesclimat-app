import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { DefaultPageProps } from '@/types'
import ModeleDemoBlock from './_components/ModeleDemoBlock'
import ModeleIssuePreviews from './_components/ModeleIssuePreviews'
import ModeleStatsBlock from './_components/ModeleStatsBlock'

export const generateMetadata = getCommonMetadata({
  title: t('Notre modèle de données - Nos Gestes Climat'),
  description: t(
    "Découvrez le modèle de données de notre calculateur d'empreinte climat"
  ),
  alternates: {
    canonical: '/modele',
  },
})

export default async function ModelePage({ params }: DefaultPageProps) {
  const { locale } = await params
  return (
    <div>
      <Title
        title={
          <Trans locale={locale}>
            Le modèle d'empreinte carbone de référence
          </Trans>
        }
      />

      <p>
        <Trans locale={locale} i18nKey="model.intro">
          Derrière le site nosgestesclimat.fr, se cache le modèle d'empreinte
          climat individuelle de consommation de référence.
        </Trans>
      </p>

      <p>
        <Trans locale={locale} i18nKey="model.intro2">
          Entièrement ouvert (open source) et contributif, chacun peut l'
          <Link href="/documentation">explorer</Link>,{' '}
          <Link href="https://github.com/incubateur-ademe/nosgestesclimat">
            l'améliorer
          </Link>
          .
        </Trans>
      </p>

      <h2>
        💫 <Trans locale={locale}>Une technologie moderne</Trans>
      </h2>

      <p>
        <Trans locale={locale} i18nKey="model.modern">
          Le modèle est basé sur{' '}
          <Link href="https://publi.codes">publicodes</Link>, un langage conçu
          par l'État pour exprimer des algorithmes d'intérêt public.
        </Trans>
      </p>

      <p>
        <Trans locale={locale} i18nKey="model.modern2">
          Entièrement paramétrable, depuis les questions posées à l'utilisateur
          jusqu'aux hypothèses du modèle de calcul, il peut être réutilisé{' '}
          <Link href="https://github.com/incubateur-ademe/nosgestesclimat/blob/master/LICENSE">
            librement
          </Link>{' '}
          par tout type d'acteur.
        </Trans>
      </p>

      <p>
        <Trans locale={locale} i18nKey="model.modern3">
          ⬇️ Ci-dessous, vous pouvez voir l'influence de 3 paramètres de calcul
          sur les résultats finaux.
        </Trans>
      </p>

      <ModeleDemoBlock />

      <p>
        🕵️
        <Trans locale={locale} i18nKey="model.modern4">
          Le modèle de calcul est directement embarqué chez le client, le calcul
          a lieu là dans votre navigateur, pas sur nos serveurs. Les données
          collectées sont si descriptives de la vie des utilisateurs, donc
          sensibles en termes de vie privée, que faire les calculs côté serveur{' '}
          <a href="https://github.com/incubateur-ademe/nosgestesclimat-site/issues/400">
            et les stocker
          </a>{' '}
          poserait un risque trop élevé.
        </Trans>
      </p>

      <h2>
        📚️ <Trans locale={locale}>Un modèle complet</Trans>
      </h2>

      <ModeleStatsBlock />

      <p>
        <Trans locale={locale} i18nKey={'model.stats2'}>
          Il est constitué d'une combinaison de centaines de modèles micro
          "bottom-up" pour les consommations carbonées de notre vie quotidienne,
          et d'un modèle "top-down" dérivé des travaux du SDES pour estimer
          l'empreinte par personne des services dits sociétaux (services publics
          et services de base tels les télécom).{' '}
          <a href="https://github.com/incubateur-ademe/nosgestesclimat/releases/tag/2.5.0">
            En savoir plus sur cette hybridation
          </a>
          .
        </Trans>
      </p>

      <h2>
        ⏩️ <Trans locale={locale}>En développement actif</Trans>
      </h2>

      <p>
        <Trans locale={locale} i18nKey={'model.active.documented'}>
          La construction du modèle (pistes de travail, réflexions en cours,
          feuille de route, etc.) est amplement{' '}
          <a href="https://github.com/incubateur-ademe/nosgestesclimat/issues">
            documentée publiquement
          </a>
          .
        </Trans>
      </p>

      <ModeleIssuePreviews />
    </div>
  )
}
