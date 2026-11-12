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
          <strong>Taux de sollicitation du support :</strong>{' '}
          <strong className="text-slate-600">360 utilisateurs</strong>
          &nbsp;ont fait appel au support (2025), soit{' '}
          <strong className="text-slate-600">0,05%</strong> des utilisateurs
          ayant terminé leur simulation
        </p>
        <p>
          <strong>Taux de complétion :</strong>{' '}
          <strong className="text-slate-600">84%</strong> des utilisateurs ayant
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
          <strong>Nombre de visiteurs :</strong>{' '}
          <strong className="text-slate-600">
            1,967 millions utilisateurs
          </strong>{' '}
          ayant visité le site au cours de l’année (2025)
        </p>
        <p>
          <strong>Nombre de simulations terminées :</strong>{' '}
          <strong className="text-slate-600">630 334 simulations</strong> sur
          l’année, soit un cumul de{' '}
          <strong className="text-slate-600">3 millions</strong> au 30/04/2026
        </p>
        <p>
          <strong>Nombre d’inscrits aux infolettres :</strong>{' '}
          <strong className="text-slate-600">204 000</strong> au 30/04/2025
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
          <strong className="text-slate-600">83%</strong> : NGC leur a fait
          prendre conscience de leur impact
          <br />
          <strong className="text-slate-600">81%</strong> : NGC leur a donné
          envie d’agir
          <br />
          <strong className="text-slate-600">66%</strong> : NGC les a aidés à
          identifier des actions concrètes pour réduire
        </p>
        <p>
          <strong>Net Promoter Score (S1 2026) :</strong>{' '}
          <strong className="text-slate-600">35</strong>
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
            leur empreinte (déclaratif*) :
          </strong>{' '}
          <strong className="text-slate-600">37% des utilisateurs</strong>{' '}
          déclarent avoir mis en place de nouvelles actions pour réduire leur
          empreinte après avoir fait le test NGC
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
          <strong>Budget sur l’année (2025) :</strong>{' '}
          <strong className="whitespace-nowrap text-slate-600">
            1&nbsp;160&nbsp;667&nbsp;€
          </strong>
        </p>
        <p>
          <strong>Coût à la simulation terminée (2025) :</strong>{' '}
          <strong className="whitespace-nowrap text-slate-600">
            1,84&nbsp;€
          </strong>
        </p>
      </Trans>
    ),
  },
]
