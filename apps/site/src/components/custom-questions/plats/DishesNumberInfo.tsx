'use client'

import Trans from '@/components/translation/trans/TransClient'
import Emoji from '@/design-system/utils/Emoji'
import { useRule } from '@/publicodes-state'

export default function DishesNumberInfo() {
  const { numericValue: totalNumberOfPlats } = useRule(
    'ui . nombre de repas par semaine'
  )

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
