import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'

export default function DocumentationBlock() {
  return (
    <div>
      <Title tag="h2" size="lg">
        <Trans i18nKey="simulation.eau.documentation.title">
          Comment est calculée votre empreinte ?
        </Trans>
      </Title>

      <p>
        <Trans i18nKey="simulation.eau.documentation.description">
          Notre calculateur repose sur un modèle de données, dont l'intégralité
          des calculs est documentée ; les données affichées sont directement
          associées à votre test.
        </Trans>
      </p>

      <Link href="/documentation/bilan" className="flex items-center">
        <Trans i18nKey="simulation.eau.documentation.link">
          Comprendre le calcul
        </Trans>
      </Link>
    </div>
  )
}
