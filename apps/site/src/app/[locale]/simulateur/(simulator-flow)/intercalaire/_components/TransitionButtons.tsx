'use client'

import Trans from '@/components/translation/trans/TransClient'
import { END_PAGE_PATH, SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFormState } from '@/publicodes-state'
import type { Categories } from '@incubateur-ademe/nosgestesclimat'
import getNamespace from '../../../../../../../e2e/utils/getNamespace'
export default function TransitionButtons() {
  const { gotoNextQuestion, nextQuestion } = useFormState()
  const nextQuestionCategory = getNamespace(nextQuestion)
  const { t } = useClientTranslation()

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

      <ButtonLink
        href={!nextQuestionCategory ? END_PAGE_PATH : SIMULATOR_PATH}
        data-testid="skip-question-button"
        onClick={gotoNextQuestion}>
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
      </ButtonLink>
    </div>
  )
}
