'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { getSimulationMode } from '@/helpers/server/model/simulations'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useOptionalSimulation } from '@/publicodes-state'

interface Props {
  /** Disabled once the question is answered: skipping would overwrite it. */
  isMissing: boolean
  onSkip: () => void
}

export default function DontKnowButton({ isMissing, onSkip }: Props) {
  const { t } = useClientTranslation()
  const maybeSimulation = useOptionalSimulation()
  const isSchoolMode = getSimulationMode(maybeSimulation) === 'scolaire'

  return (
    <div className="mt-4 mb-4 flex flex-col items-start gap-4 md:flex-row">
      <Button
        onClick={onSkip}
        className="dark text-sm!"
        variant="filled"
        disabled={!isMissing}
        data-testid="skip-question-button"
        aria-label={t(
          'common.navigation.nextQuestion.dontKnow.title',
          'Je ne sais pas répondre, passer et aller à la question suivante'
        )}>
        <Trans i18nKey="simulator.dontKnow.button.label">
          Je ne sais pas répondre
        </Trans>
      </Button>

      <p className="text-primary-600 w-80 max-w-full text-sm">
        {isSchoolMode ? (
          <Trans i18nKey="simulator.dontKnow.button.reassuranceYouth">
            Pas d'inquiétude, on prend des données moyennes pour garder les
            résultats fiables.
          </Trans>
        ) : (
          <Trans i18nKey="simulator.dontKnow.button.reassurance">
            Pas d'inquiétude : nous utiliserons des données moyennes, le
            résultat reste fiable
          </Trans>
        )}
      </p>
    </div>
  )
}