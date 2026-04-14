'use client'

import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'

export default function DishesNumberInfo() {
  const { t } = useClientTranslation()

  const { numericValue: totalNumberOfPlats } = useRule(
    'ui . nombre de repas par semaine'
  )

  return (
    <>
      <div aria-live="polite" className="mb-2 text-center text-sm">
        {totalNumberOfPlats !== 14 ? (
          <span className="text-red-700">
            {t(
              'simulator.customQuestions.plats.selectionStart',
              'Vous avez sélectionné'
            )}{' '}
            <strong>{totalNumberOfPlats}</strong>{' '}
            <strong>
              {t('simulator.customQuestions.plats.meals', 'repas')}
            </strong>{' '}
            {t(
              'simulator.customQuestions.plats.selectionEnd',
              'sur les 14 habituels'
            )}{' '}
            <Emoji>🍽️</Emoji>
          </span>
        ) : null}
        {totalNumberOfPlats === 14 ? (
          <span>
            <strong>{totalNumberOfPlats}</strong>{' '}
            <strong>{t('simulator.customQuestions.plats.meals')}</strong>{' '}
            {t('simulator.customQuestions.plats.perWeek', 'par semaine, miam')}
            <Emoji>😋</Emoji>
          </span>
        ) : null}
      </div>
    </>
  )
}
