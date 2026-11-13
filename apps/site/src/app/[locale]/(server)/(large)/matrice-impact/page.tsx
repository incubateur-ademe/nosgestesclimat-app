import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import ImpactCard from './_components/ImpactCard'
import { impactMatrixData } from './_constants/impactMatrixData'

export default function ImpactMatrixPage() {
  return (
    <>
      <Title tag="h1" className="text-3xl/normal! font-medium">
        <Trans i18nKey="impact_matrix.title">Matrice d'impact</Trans>
      </Title>

      <div className="w-3xl max-w-full">
        <Trans i18nKey="impact_matrix.description">
          <p>
            Cette matrice permet de suivre l’
            <strong>impact de Nos Gestes Climat</strong>.
          </p>
          <p>
            Nos indicateurs d’usage et d’impact sont suivis grâce aux outils
            Posthog, Matomo et Metabase.
          </p>
          <p className="mb-12">
            Les retours déclaratifs sont basés sur l’enquête utilisateurs
            réalisée <strong>en juin 2026</strong> auprès des inscrits à
            l’infolettre - <strong>3 000 répondants</strong> (*).
          </p>
        </Trans>
      </div>

      <ul className="align-items-stretch grid grid-cols-1 items-stretch gap-4 pb-28 sm:grid-cols-2 lg:grid-cols-3">
        {impactMatrixData.map((item) => (
          <ImpactCard {...item} key={`impact-matrix-item-${item.id}`} />
        ))}
      </ul>
    </>
  )
}
