'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFormState } from '@/publicodes-state'

export default function DontKnowButton() {
  const { gotoNextQuestion } = useFormState()

  const { t } = useClientTranslation()

  return (
    <div className="mt-4 flex flex-col items-start gap-4 md:flex-row">
      <Button
        onClick={gotoNextQuestion}
        className="text-sm!"
        color="borderless"
        aria-label={t(
          'common.navigation.nextQuestion.dontKnow.title',
          'Je ne sais pas répondre, passer et aller à la question suivante'
        )}>
        <Trans i18nKey="simulator.dontKnow.button.label">
          Je ne sais pas répondre
        </Trans>
      </Button>

      <p className="text-primary-600 w-80 max-w-full text-sm">
        <Trans i18nKey="simulator.dontKnow.button.reassurance">
          Pas d’inquiétude, on prend des données moyennes pour garder vos
          résultats fiables.
        </Trans>
      </p>
    </div>
  )
}
