'use client'

import Trans from '@/components/translation/trans/TransClient'
import Emoji from '@/design-system/utils/Emoji'
import { useRule } from '@/publicodes-state'

export default function DishesNumberInfo() {
  const { numericValue: numberRepasVegetalien } = useRule(
    'alimentation . repas . déjeuner et dîner . végétalien . nombre'
  )
  const { numericValue: numberRepasVegetarien } = useRule(
    'alimentation . repas . déjeuner et dîner . végétarien . nombre'
  )
  const { numericValue: numberRepasViandeRouge } = useRule(
    'alimentation . repas . déjeuner et dîner . viande rouge . nombre'
  )
  const { numericValue: numberRepasViandeBlanche } = useRule(
    'alimentation . repas . déjeuner et dîner . viande blanche . nombre'
  )
  const { numericValue: numberRepasPoissonGras } = useRule(
    'alimentation . repas . déjeuner et dîner . poisson gras . nombre'
  )
  const { numericValue: numberRepasPoissonBlanc } = useRule(
    'alimentation . repas . déjeuner et dîner . poisson blanc . nombre'
  )

  const totalNumberOfPlats =
    numberRepasVegetalien +
    numberRepasVegetarien +
    numberRepasViandeRouge +
    numberRepasViandeBlanche +
    numberRepasPoissonGras +
    numberRepasPoissonBlanc

  return (
    <>
      <div aria-live="polite" className="-mt-2 mb-3 text-center text-sm">
        {totalNumberOfPlats !== 14 ? (
          <span className="text-red-700">
            <Trans
              values={{ totalNumberOfPlats }}
              i18nKey="simulator.customQuestions.plats.selection.under_14">
              Vous avez sélectionné{' '}
              <strong>
                {{ totalNumberOfPlats } as unknown as React.ReactNode} repas
              </strong>{' '}
              sur les 14 habituels <Emoji>🍽️</Emoji>
            </Trans>
          </span>
        ) : null}
        {totalNumberOfPlats === 14 ? (
          <span>
            <Trans
              values={{ totalNumberOfPlats }}
              i18nKey="simulator.customQuestions.plats.selection.equal_or_over_14">
              <strong>
                {{ totalNumberOfPlats } as unknown as React.ReactNode} repas
              </strong>{' '}
              par semaine, miam <Emoji>😋</Emoji>
            </Trans>
          </span>
        ) : null}
      </div>
    </>
  )
}
