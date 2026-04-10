import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import {
  captureEndClickDocumentationServer,
  endClickDocumentationServer,
} from '@/constants/tracking/pages/end'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'

interface Props {
  locale: Locale
}

export default function DocumentationBlock({ locale }: Props) {
  return (
    <div>
      <Title tag="h2" size="lg" hasSeparator={false}>
        <Trans locale={locale} i18nKey="simulation.eau.documentation.title">
          Comment est calculée votre empreinte ?
        </Trans>
      </Title>

      <p>
        <Trans
          locale={locale}
          i18nKey="simulation.eau.documentation.description">
          Notre calculateur repose sur un modèle de données, dont l'intégralité
          des calculs est documentée ; les données affichées sont directement
          associées à votre test.
        </Trans>
      </p>

      <Link
        href="/documentation/bilan"
        className="flex items-center"
        data-track-event={endClickDocumentationServer}
        data-track-posthog={captureEndClickDocumentationServer}>
        <Trans locale={locale} i18nKey="simulation.eau.documentation.link">
          Comprendre le calcul
        </Trans>
      </Link>
    </div>
  )
}
