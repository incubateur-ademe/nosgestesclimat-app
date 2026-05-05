'use client'
import Trans from '@/components/translation/trans/TransClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFormState } from '@/publicodes-state'
import type { Categories } from '@incubateur-ademe/nosgestesclimat'
import { useRouter } from 'next/navigation'
import { useEndTest } from '../../[root]/_hooks/useEndPage'

interface Props {
  nextCategory: Categories
  showResults?: boolean
}

export default function TransitionButtons({
  nextCategory,
  showResults,
}: Props) {
  const router = useRouter()

  const { gotoNextQuestion } = useFormState()
  const { endTest, isPending } = useEndTest()

  const { t } = useClientTranslation()

  const getCategoryString = (category: Categories) => {
    switch (category) {
      case 'logement':
        return t('au logement')
      case 'alimentation':
        return t("à l'alimentation")
      case 'transport':
        return t('au transport')
      default:
        return t('à la consommation')
    }
  }

  const handleGoToNextQuestion = () => {
    if (showResults) {
      endTest()
      return
    }
    gotoNextQuestion()
    router.push(SIMULATOR_PATH)
  }

  return (
    <div className="my-8 flex gap-4 md:flex-row">
      <Button
        title={t(
          'common.previousExtended',
          'Précédent, revenir à la page précédente'
        )}
        className="h-full w-14 md:w-auto"
        color="secondary"
        onClick={() => router.back()}
        disabled={isPending}>
        <span aria-hidden className="text-xl md:mr-1.5">
          ←
        </span>
        <span className="sr-only md:not-sr-only">
          <Trans i18nKey="common.previous">Précédent</Trans>
        </span>
      </Button>

      <Button onClick={handleGoToNextQuestion} disabled={isPending}>
        {showResults ? (
          <Trans i18nKey="simulator.intercalaire.seeResults">
            Voir mes résultats
          </Trans>
        ) : (
          <>
            <Trans
              values={{ nextCategory: getCategoryString(nextCategory) }}
              i18nKey="simulator.intercalaire.nextButton">
              Passer {{ nextCategory } as unknown as string}
            </Trans>{' '}
          </>
        )}
        <span aria-hidden className="ml-1.5 inline-block text-xl">
          →
        </span>
      </Button>
    </div>
  )
}
