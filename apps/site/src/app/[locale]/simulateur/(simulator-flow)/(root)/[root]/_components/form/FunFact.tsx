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
      <div
        className={`rounded-xl border-2 ${getBorderCategoryColor(currentCategory, '200')} ${getBgCategoryColor(currentCategory, '100')} hidden px-4 py-6 text-sm md:block`}>
        <h3 className="mb-2">
          <Emoji>💡</Emoji>{' '}
          <Trans i18nKey="simulator.funFact.housing.title">
            Le saviez-vous ?
          </Trans>
        </h3>
        <p className="mb-0">
          <strong>
            <Trans i18nKey="simulator.funFact.housing.text1">
              La taille des logements français a très fortement augmenté
            </Trans>
          </strong>{' '}
          <Trans i18nKey="simulator.funFact.housing.text2">
            sur ces 50 dernières années, passant de 23 à 40 m² par habitant,
            soit
          </Trans>{' '}
          <strong>
            <Trans i18nKey="simulator.funFact.housing.text3">
              90 m² en moyenne pour un foyer de 2,2 personnes.
            </Trans>
          </strong>
        </p>
      </div>
    )
  }

  if (question === 'divers . textile . volume') {
    return (
      <div
        className={`rounded-xl border-2 ${getBorderCategoryColor(currentCategory, '200')} ${getBgCategoryColor(currentCategory, '100')} hidden px-4 py-6 text-sm md:block`}>
        <h3 className="mb-2">
          <Emoji>💡</Emoji>{' '}
          <Trans i18nKey="simulator.funFact.clothing.title">
            Le saviez-vous ?
          </Trans>
        </h3>
        <p className="mb-0">
          <Trans i18nKey="simulator.funFact.clothing.text1">
            En moyenne, les Français achètent chaque année,
          </Trans>{' '}
          <strong>
            <Trans i18nKey="simulator.funFact.clothing.text2">
              {/* Chiffres issus de https://agirpourlatransition.ademe.fr/acteurs-education/enseigner/mode-dessus-dessous */}
              9,5 kg de vêtements... mais n'en trient que 3,4 kg !
            </Trans>{' '}
          </strong>
        </p>
      </div>
    )
  }

  return null
}
