'use client'

import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'

export default function ClimateAndWater() {
  return (
    <div className="mb-12">
      <Title hasSeparator={false} size="lg">
        <Trans i18nKey="simulation.eau.climateAndWater.title">
          Eau, climat, même combat ?
        </Trans>
      </Title>

      <p>
        <Trans i18nKey="simulation.eau.climateAndWater.description1">
          Les activités humaines menacent les équilibres naturels de notre
          planète.
        </Trans>{' '}
        <Trans i18nKey="simulation.eau.climateAndWater.description2">
          Comme le climat,{' '}
          <strong>
            le cycle de l'eau est fortement impacté partout dans le monde
          </strong>{' '}
          : accès à l'eau potable, disparition et migration d'espèces (animales
          et végétales), déplacement de populations.
        </Trans>
      </p>
    </div>
  )
}
