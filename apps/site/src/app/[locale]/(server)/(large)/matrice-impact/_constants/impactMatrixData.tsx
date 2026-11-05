import Trans from '@/components/translation/trans/TransServer'
import type { ImpactMatrixItem } from '../_types/type'

export const impactMatrixData: ImpactMatrixItem[] = [
  {
    id: 'utilisable',
    type: 'usage',
    title: <Trans i18nKey="impact_matrix.items.first.title">Utilisable</Trans>,
    description: (
      <Trans i18nKey="impact_matrix.items.first.description">
        <p>
          <strong>Taux de sollicitation du support :</strong> 360 utilisateurs
          ont fait appel au support (2025), soit 0,05% des utilisateurs ayant
          terminé leur simulation
        </p>
        <p>
          <strong>Taux de complétion :</strong> 84% des utilisateurs ayant
          commencé le test sont arrivés jusqu’à la page de résultats (mai 2026)
        </p>
      </Trans>
    ),
  },
  {
    id: 'utilisé',
    type: 'usage',
    title: <Trans i18nKey="impact_matrix.items.second.title">Utilisé</Trans>,
    description: (
      <Trans i18nKey="impact_matrix.items.second.description">
        <p>
          <strong>Nombre de visiteurs :</strong> 1,967 millions utilisateurs
          ayant visité le site au cours de l’année (2025)
        </p>
        <p>
          <strong>Nombre de simulations terminées :</strong> 630 334 simulations
          sur l’année, soit un cumul de 3 millions au 30/04/2026
        </p>
        <p>
          <strong>Nombre d’inscrits aux infolettres :</strong> 204 000 au
          30/04/2025
        </p>
      </Trans>
    ),
  },
  {
    id: 'utile',
    type: 'impact',
    title: <Trans i18nKey="impact_matrix.items.third.title">Utile</Trans>,
    description: (
      <Trans i18nKey="impact_matrix.items.third.description">
        <p>
          <strong>
            Appréciation de l’utilité de l’outil par les utilisateurs ayant
            terminé le test (déclaratif*) :
          </strong>
          <br />
          <strong>83%</strong> : NGC leur a fait prendre conscience de leur
          impact
          <br />
          <strong>81%</strong> : NGC leur a donné envie d’agir
          <br />
          <strong>66%</strong> : NGC les a aidés à identifier des actions
          concrètes pour réduire
        </p>
        <p>
          <strong>Net Promoter Score (S1 2026) :</strong> 35
        </p>
      </Trans>
    ),
  },
  {
    id: 'impactant',
    type: 'impact',
    title: <Trans i18nKey="impact_matrix.items.fourth.title">Impactant</Trans>,
    description: (
      <Trans i18nKey="impact_matrix.items.fourth.description">
        <p>
          <strong>
            Taux de passage à l’action des utilisateurs post test pour réduire
            leur empreinte (déclaratif*) : 37%
          </strong>{' '}
          des utilisateurs déclarent avoir mis en place de nouvelles actions
          pour réduire leur empreinte après avoir fait le test NGC
        </p>
      </Trans>
    ),
  },
  {
    id: 'efficient',
    type: 'efficiency',
    title: <Trans i18nKey="impact_matrix.items.fifth.title">Efficient</Trans>,
    description: (
      <Trans i18nKey="impact_matrix.items.fifth.description">
        <p>
          <strong>Budget sur l’année (2025) :</strong> 1 160 667 euros
        </p>
        <p>
          <strong>Coût à la simulation terminée (2025) :</strong> 1,84&nbsp;€
        </p>
      </Trans>
    ),
  },
]
