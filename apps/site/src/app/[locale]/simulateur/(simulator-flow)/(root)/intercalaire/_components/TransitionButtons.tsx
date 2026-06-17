'use client'

import Trans from '@/components/translation/trans/TransClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFormState } from '@/publicodes-state'
import getNamespace from '@/publicodes-state/helpers/getNamespace'
import type { Categories } from '@incubateur-ademe/nosgestesclimat'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useEndTest } from '../../bilan/_hooks/useEndPage'
export default function TransitionButtons() {
  const { gotoNextQuestion, nextQuestion } = useFormState()
  const nextQuestionCategory = getNamespace(nextQuestion)
  const { t } = useClientTranslation()

  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { endTest } = useEndTest()
  function handleGoToNextQuestion() {
    if (isPending) return
    startTransition(() => {
      if (!nextQuestionCategory) {
        endTest()
      } else {
        router.push(SIMULATOR_PATH)
        gotoNextQuestion()
      }
    })
  }

  const getCategoryString = (category: Categories) => {
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
      <ButtonLink
        title={t(
          'common.previousExtended',
          'Précédent, revenir à la page précédente'
        )}
        disabled={isPending}
        href={SIMULATOR_PATH}
        className="h-full w-14 md:w-auto"
        color="secondary">
        <span aria-hidden className="text-xl md:mr-1.5">
          ←
        </span>
        <span className="sr-only md:not-sr-only">
          <Trans i18nKey="common.previous">Précédent</Trans>
        </span>
      </ButtonLink>

      <Button
        data-testid={
          !nextQuestionCategory ? 'end-test-button' : 'skip-question-button'
        }
        loading={isPending}
        onClick={handleGoToNextQuestion}>
        {!nextQuestionCategory ? (
          <Trans i18nKey="simulator.intercalaire.seeResults">
            Voir mes résultats
          </Trans>
        ) : (
          getCategoryString(nextQuestionCategory as Categories)
        )}

        <span aria-hidden className="ml-1.5 inline-block text-xl">
          →
        </span>
      </Button>
    </div>
  )
}
