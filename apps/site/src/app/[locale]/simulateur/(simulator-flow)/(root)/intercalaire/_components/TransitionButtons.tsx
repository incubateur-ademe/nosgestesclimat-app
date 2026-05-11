'use client'

import Trans from '@/components/translation/trans/TransClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFormState } from '@/publicodes-state'
import type { Categories, DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useEndTest } from '../../[root]/_hooks/useEndPage'
import { orderedCategoriesWithoutServices } from '../_constants/getOrderedCategoriesWithoutServices'

interface Props {
  category: DottedName
}

export default function TransitionButtons({ category }: Props) {
  const router = useRouter()

  const { gotoNextQuestion, currentQuestion, setCurrentQuestion } =
    useFormState()

  const searchParams = useSearchParams()

  const questionFromUrl = decodeURI(searchParams.get('question') ?? '')
    .replaceAll('.', ' . ')
    .replaceAll('_', ' ') as DottedName | ''

  // Restore currentQuestion from URL on page refresh
  useEffect(() => {
    if (!currentQuestion && questionFromUrl) {
      setCurrentQuestion(questionFromUrl)
    }
  }, [currentQuestion, questionFromUrl, setCurrentQuestion])

  const { endTest, isPending } = useEndTest()

  const { t } = useClientTranslation()

  const nextCategory: Categories | undefined = (() => {
    const currentIndex = orderedCategoriesWithoutServices.indexOf(category)
    if (currentIndex === -1) return undefined
    return orderedCategoriesWithoutServices[currentIndex + 1] as
      | Categories
      | undefined
  })()

  const isLastCategory =
    orderedCategoriesWithoutServices[
      orderedCategoriesWithoutServices.length - 1
    ] === category

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
      default:
        return t(
          'simulator.intercalaire.goToConsommation',
          'Passer à la consommation'
        )
    }
  }

  const handleGoToNextQuestion = () => {
    if (isLastCategory || !nextCategory) {
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
        {isLastCategory || !nextCategory ? (
          <Trans i18nKey="simulator.intercalaire.seeResults">
            Voir mes résultats
          </Trans>
        ) : (
          getCategoryString(nextCategory)
        )}
        <span aria-hidden className="ml-1.5 inline-block text-xl">
          →
        </span>
      </Button>
    </div>
  )
}
