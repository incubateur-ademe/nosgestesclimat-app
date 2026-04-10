'use client'

import Title from '@/design-system/layout/Title'
import { useRules } from '@/hooks/useRules'

import Link from '@/components/Link'
import LightBulbIcon from '@/components/icons/LightBulbIcon'
import SquareImageContainer from '@/components/images/SquareImageContainer'
import Trans from '@/components/translation/trans/TransClient'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import Image from 'next/image'
import { useRef } from 'react'
import SearchBar from './SearchBar'
import DocumentationLandingCard from './documentationLanding/DocumentationLandingCard'

export default function DocumentationLanding() {
  const { data: rules } = useRules({ isOptim: false })

  const { t } = useClientTranslation()

  // We want to be able to define an order for the cards and their summary here
  const fixedCardSummaries = useRef({
    bilan: t(
      `Le coeur de Nos Gestes Climat, c'est **le bilan** d'empreinte climat personnelle`
    ),
    'services sociétaux': t(
      `Les constantes de **services publics et marchands** calculées à partir des travaux du SDES`
    ),
    'alimentation . plats': t(
      `**6 repas** représentatifs de notre consommation`
    ),
    'alimentation . déchets': t(`Un modèle inédit d'empreinte des **déchets**`),
    'logement . chauffage . empreinte par défaut': t(
      `Un calcul statistique du **chauffage** résidentiel français moyen`
    ),
    'transport . voiture': t(
      `Le premier poste moyen d'empreinte, l'incontournable **voiture individuelle**`
    ),
  } as Record<DottedName, string>)

  if (!rules) return null

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-8 md:flex-nowrap">
        <div>
          <Title title={<Trans>Documentation</Trans>} />
          <p>
            <Trans>
              Le calculateur Nos Gestes Climat est basé sur le modèle de calcul
              du même nom, composé d'un ensemble de briques.
            </Trans>
          </p>
          <p>
            <Trans>
              Sur cette documentation, vous avez accès en toute transparence à
              l'ensemble des variables du calcul. À lire tranquillement au coin
              du feu.
            </Trans>
          </p>

          <div>
            <Link href="/modele" className="flex items-center">
              <LightBulbIcon className="fill-primary-700 mr-1 h-4 w-4" />
              <Trans> En savoir plus sur notre modèle</Trans>
            </Link>
          </div>
        </div>
        {/* Displayed on mobile only */}
        <Image
          className="ml-auto h-auto w-48 md:hidden md:w-full"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_girl_reading_newspaper_d171290d3d.png"
          width="400"
          height="300"
          alt={t(
            'Un femme lisant le journal au coin du feu avec un chien assoupi.'
          )}
        />
        {/* Displayed on desktop only */}
        <SquareImageContainer className="hidden max-w-96 md:flex">
          <Image
            className="ml-auto h-auto w-48 md:w-full"
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_girl_reading_newspaper_d171290d3d.png"
            width="400"
            height="300"
            alt={t(
              'Un femme lisant le journal au coin du feu avec un chien assoupi.'
            )}
          />
        </SquareImageContainer>
      </div>

      <SearchBar rules={rules} />

      <h2 className="mt-4 text-xl">
        <Trans>Quelques suggestions </Trans>
      </h2>

      <ul
        className="grid max-w-[60rem] grid-cols-1 flex-wrap gap-2 p-0 sm:grid-cols-2 md:grid-cols-3"
        role="list">
        {(Object.keys(fixedCardSummaries.current) as DottedName[]).map(
          (dottedName) => {
            return (
              <li key={dottedName}>
                <DocumentationLandingCard
                  dottedName={dottedName}
                  summary={fixedCardSummaries.current[dottedName]}
                  rule={rules[dottedName]}
                />
              </li>
            )
          }
        )}
      </ul>
    </div>
  )
}
