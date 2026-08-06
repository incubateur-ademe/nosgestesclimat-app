'use client'

import Trans from '@/components/translation/trans/TransClient'
import Emoji from '@/design-system/utils/Emoji'
import {
  getBgCategoryColor,
  getBorderCategoryColor,
} from '@/helpers/getCategoryColorClass'
import { useFormState } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  question: DottedName
}

export default function FunFact({ question }: Props) {
  const { currentCategory } = useFormState()

  if (question === 'logement . surface') {
    return (
      <Trans i18nKey="simulator.funFact.housing">
        <div
          className={`rounded-xl border-2 ${getBorderCategoryColor(currentCategory, '200')} ${getBgCategoryColor(currentCategory, '100')} hidden px-4 py-6 text-sm md:block`}>
          <h3 className="mb-2">
            <Emoji>💡</Emoji> Le saviez-vous ?
          </h3>
          <p className="mb-0">
            <strong>
              La taille des logements français a très fortement augmenté
            </strong>{' '}
            sur ces 50 dernières années, passant de 23 à 40 m² par habitant,
            soit{' '}
            <strong>90 m² en moyenne pour un foyer de 2,2 personnes.</strong>
          </p>
        </div>
      </Trans>
    )
  }

  if (question === 'divers . textile . volume') {
    return (
      <Trans i18nKey="simulator.funFact.clothing">
        <div
          className={`rounded-xl border-2 ${getBorderCategoryColor(currentCategory, '200')} ${getBgCategoryColor(currentCategory, '100')} hidden px-4 py-6 text-sm md:block`}>
          <h3 className="mb-2">
            <Emoji>💡</Emoji> Le saviez-vous ?
          </h3>
          <p className="mb-0">
            En moyenne, les Français achètent chaque année,{' '}
            <strong>
              {/* Chiffres issus de https://agirpourlatransition.ademe.fr/acteurs-education/enseigner/mode-dessus-dessous */}
              9,5 kg de vêtements... mais n'en trient que 3,4 kg !
            </strong>
          </p>
        </div>
      </Trans>
    )
  }

  if (question === 'divers . numérique . internet . durée journalière') {
    return (
      <Trans i18nKey="simulator.funFact.ia">
        <div
          className={`rounded-xl border-2 ${getBorderCategoryColor(currentCategory, '200')} ${getBgCategoryColor(currentCategory, '100')} hidden px-4 py-6 text-sm md:block`}>
          <h3 className="mb-2">
            <Emoji>💡</Emoji> Un mot sur l'IA
          </h3>
          <p className="mb-0">
            Le recours à l'intelligence artificielle entraîne une{' '}
            <strong>
              hausse de la consommation d'électricité, d'eau et d'espace pour
              les data centers
            </strong>
            . Des études sont en cours pour disposer de données fiables sur les
            impacts et mieux vous informer.
          </p>
        </div>
      </Trans>
    )
  }

  return null
}
