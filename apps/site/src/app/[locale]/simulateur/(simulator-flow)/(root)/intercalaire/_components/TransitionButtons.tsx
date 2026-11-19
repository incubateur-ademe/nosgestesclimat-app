'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useFormNavigation } from '@/form-controller'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useTransition } from 'react'

export default function TransitionButtons() {
  const { next, prev } = useFormNavigation()
  const { t } = useClientTranslation()
  // Leaving the intercalaire loads the simulator route: show it.
  const [isLeaving, startLeaving] = useTransition()

  // Same mapping as the question navigation: the end-test id marks the button
  // that finishes the test (loading included), the skip id a step that only
  // advances.
  const nextTestId =
    next.kind === 'next' ? 'skip-question-button' : 'end-test-button'

  const getCategoryString = (category: DottedName) => {
    switch (category) {
      case 'logement':
        return t('simulator.intercalaire.goToLogement', 'Passer au logement')
      case 'alimentation':
        return t(
          'simulator.intercalaire.goToAlimentation',
          "Passer à l'alimentation"
        )
      case 'transport':
        return t('simulator.intercalaire.goToTransport', 'Passer au transport')
      case 'divers':
        return t(
          'simulator.intercalaire.goToConsommation',
          'Passer à la consommation'
        )
    }
  }

  return (
    <div className="my-8 flex gap-4 md:flex-row">
      <Button
        title={t(
          'common.previousExtended',
          'Précédent, revenir à la page précédente'
        )}
        loading={isLeaving}
        disabled={prev.isDisabled}
        onClick={() => startLeaving(prev.go)}
        className="h-full w-14 md:w-auto"
        variant="outlined">
        <span aria-hidden className="text-xl md:mr-1.5">
          ←
        </span>
        <span className="sr-only md:not-sr-only">
          <Trans i18nKey="common.previous">Précédent</Trans>
        </span>
      </Button>

      <Button
        data-testid={nextTestId}
        loading={next.kind === 'loading'}
        disabled={next.isDisabled}
        onClick={next.go}>
        {!next.category ? (
          <Trans i18nKey="simulator.intercalaire.seeResults">
            Voir mes résultats
          </Trans>
        ) : (
          getCategoryString(next.category)
        )}

        <span aria-hidden className="ml-1.5 inline-block text-xl">
          →
        </span>
      </Button>
    </div>
  )
}
